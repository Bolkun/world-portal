import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, HostListener } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ApiReliefwebService } from 'src/app/services/api-reliefweb.service';
import { Router } from "@angular/router";
import gsap from 'gsap';
import * as THREE from 'three';
// @ts-ignore
import vertexShader from 'src/assets/shaders/vertex.glsl';
// @ts-ignore
import fragmentShader from 'src/assets/shaders/fragment.glsl';
// @ts-ignore
import atmosphereVertexShader from 'src/assets/shaders/atmosphereVertex.glsl';
// @ts-ignore
import atmosphereFragmentShader from 'src/assets/shaders/atmosphereFragment.glsl';
// @ts-ignore
import locationVertexShader from 'src/assets/shaders/locationVertex.glsl';
// @ts-ignore
import locationFragmentShader from 'src/assets/shaders/locationFragment.glsl';
import { MatDialog } from '@angular/material/dialog';
import { FilterPopUpComponent } from '../filter-pop-up/filter-pop-up.component';
import { ArticleComponent } from '../article/article.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit, AfterViewInit {
  slideLoginActive: boolean = false;
  slideAboutActive: boolean = false;
  filterOptionsActive: boolean = false;

  // API
  date = this.apiReliefwebService.getCurrentDate(); // form: 2021-12-03
  apiData: any;
  // THREE
  @ViewChild('canvas') private canvasRef!: ElementRef;
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  @Input() public rotationSpeedY: number = 0.0025;
  private bRotateEarth: boolean = true;
  private bLoginOpen: boolean = false;
  private bLoginClose: boolean = false;
  private bAboutOpen: boolean = false;
  private bAboutClose: boolean = false;
  private groupRotate = new THREE.Group();
  private groupLocations = new THREE.Group();
  private radius = 1;
  private earth = new THREE.Mesh(
    new THREE.SphereGeometry(this.radius, 32, 32), // radius, widthSegments, heightSegments
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        globeTexture: {
          value: new THREE.TextureLoader().load('/assets/img/earth2.jpg')
        }
      }
    })
  );
  private atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(this.radius, 32, 32),
    new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      //blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    })
  );
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private rMouse = new THREE.Vector2();
  private cameraAnngle = 70;
  private cameraZPosition = 3.0;
  private zoom = 0.2;
  // Bg
  private ang_rad = this.cameraAnngle * Math.PI / 180;
  private fov_y = this.cameraZPosition * Math.tan(this.ang_rad / 2) * 2;
  private bgGalaxy = new THREE.Mesh(
    new THREE.PlaneGeometry(this.fov_y * window.innerWidth / window.innerHeight, this.fov_y),
    new THREE.MeshBasicMaterial({
      map: new THREE.ImageUtils.loadTexture('/assets/img/background.jpg'),
      transparent: true,
      opacity: 0.2
    })
  );
  private starGeometry = new THREE.BufferGeometry();
  private starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
  private stars: THREE.Points;
  // Rotate earth
  private mouse = { x: 0, y: 0 };
  private last!: MouseEvent;
  private mouseDown: boolean = false;
  @HostListener('click', ['$event.target']) onClick(event) {
    this.raycaster.setFromCamera(this.rMouse, this.camera);
    let intersects = this.raycaster.intersectObjects(this.groupLocations.children);
    // Hit
    if (intersects.length > 0) {
      // Open Modal
      this.modalCtl.open(ArticleComponent, {
        data: intersects
      });
    }
  }
  @HostListener('mouseup', ['$event']) onMouseup(event) {
    this.mouseDown = false;
  }
  @HostListener('mouseout') onMouseout() {
    // Cursour leaves the window
    this.mouseDown = false;
  }
  @HostListener('mousemove', ['$event']) onMousemove(event: MouseEvent) {
    if (this.slideLoginActive == false && this.slideAboutActive == false) {
      // Tooltip
      this.rMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.rMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
      if (this.mouseDown) {
        // Stop earth rotation
        this.bRotateEarth = false;
        // Rotate earth on mousedown + mousemove
        this.earth.rotation.y += (event.clientX - this.last.clientX) / 400;
        this.earth.rotation.x += (event.clientY - this.last.clientY) / 400;
        // Added smooth rotation
        this.mouse.x = (event.clientX / innerWidth) * 4 - 1;
        this.mouse.y = -(event.clientY / innerHeight) * 4 + 1;
        // Save last position
        this.last = event;
        this.rotateEarth(this.last.clientX, this.last.clientY);
      }
    }
  }
  @HostListener('mousedown', ['$event']) onMousedown(event) {
    this.mouseDown = true;
    this.last = event;
  }
  @HostListener('window:resize', ['$event']) onResize(event) {
    // Resize canvas
    this.camera.aspect = window.innerWidth / window.innerHeight;
    // BG
    let new_geometry = new THREE.PlaneGeometry(this.fov_y * window.innerWidth / window.innerHeight, this.fov_y);
    this.bgGalaxy.geometry.dispose();
    this.bgGalaxy.geometry = new_geometry;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  @HostListener("wheel", ["$event"]) onScroll(event: WheelEvent) {
    if (this.slideLoginActive == false && this.slideAboutActive == false) {
      if (event.deltaY == -100 && this.camera.zoom < 7) {
        // +
        this.camera.zoom += this.zoom;
        this.camera.updateProjectionMatrix();
      } else if (event.deltaY == 100 && this.camera.zoom > 1) {
        // -
        this.camera.zoom -= this.zoom;
        this.camera.updateProjectionMatrix();
      }
    }
  }

  constructor(
    public userService: UserService,
    public apiReliefwebService: ApiReliefwebService,
    public router: Router,
    private modalCtl: MatDialog
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.createScene();
    this.startRenderingLoop();
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.add(this.bgGalaxy);
    const starVertices: any[] = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.3) * 2000;
      const y = (Math.random() - 0.3) * 2000;
      const z = -Math.random() * 2000;
      starVertices.push(x, y, z);
    }
    this.starGeometry.addAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    this.stars = new THREE.Points(this.starGeometry, this.starMaterial);
    this.scene.add(this.stars);
    this.groupRotate.add(this.earth);
    this.earth.rotation.y = 4;  // Default start from Africa
    this.scene.add(this.groupRotate);
    this.atmosphere.scale.set(1.1, 1.1, 1.1);
    this.groupRotate.add(this.atmosphere);

    this.camera = new THREE.PerspectiveCamera(this.cameraAnngle, window.innerWidth / window.innerHeight, 0.001, 1000);
    this.camera.position.z = this.cameraZPosition;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.apiReliefwebService.getDisastersByDate(this.date).subscribe((data) => {
      this.apiData = data;
      let filteredAPIData: any[] = [];

      setTimeout(() => {
        // filter api data based on current date and past dates
        if (this.date == this.apiReliefwebService.getCurrentDate()) {
          for (let i = 0; i < this.apiData.count; i++) {
            if (this.apiData.data[i].fields.status === "current") {
              let oArticleData: any = {
                lat: this.apiData.data[i].fields.primary_country.location.lat,
                lon: this.apiData.data[i].fields.primary_country.location.lon,
                id: this.apiData.data[i].id,
                country: this.apiData.data[i].fields.primary_country.name,
                disaster_type: this.apiData.data[i].fields.type,
                title: this.apiData.data[i].fields.name,
                body: this.apiData.data[i].fields["description-html"],
                link: this.apiData.data[i].fields.url
              };
              filteredAPIData.push(oArticleData);
            }
          }
          //console.log(filteredAPIData);
        } else {
          for (let i = 0; i < this.apiData.totalCount; i++) {
            if (this.apiData.data[i].fields.disaster_type) {
              if (this.apiData.data[i].fields.primary_country.location) {
                let oArticleData: any = {
                  lat: this.apiData.data[i].fields.primary_country.location.lat,
                  lon: this.apiData.data[i].fields.primary_country.location.lon,
                  id: this.apiData.data[i].id,
                  country: this.apiData.data[i].fields.primary_country.name,
                  disaster_type: this.apiData.data[i].fields.disaster_type,
                  title: this.apiData.data[i].fields.title,
                  body: this.apiData.data[i].fields["body-html"],
                  link: this.apiData.data[i].fields.origin
                };
                filteredAPIData.push(oArticleData);
              }
            }
          }
        }

        // Build objects with api data
        for (let j = 0; j < filteredAPIData.length; j++) {
          let pos = this.convertLatLonToCartesian(filteredAPIData[j].lat, filteredAPIData[j].lon);
          let location = new THREE.Mesh(
            new THREE.SphereGeometry(0.01, 20, 20),
            new THREE.ShaderMaterial({
              vertexShader: locationVertexShader,
              fragmentShader: locationFragmentShader
            })
          );
          location.position.set(pos.x, pos.y, pos.z);
          this.groupLocations.add(location);
          this.earth.add(this.groupLocations);
          // Adding api data to three.js objects
          location.userData.lat = filteredAPIData[j].lat;
          location.userData.lon = filteredAPIData[j].lon;
          location.userData.id = filteredAPIData[j].id;
          location.userData.country = filteredAPIData[j].country;
          location.userData.disaster_type = filteredAPIData[j].disaster_type;
          location.userData.title = filteredAPIData[j].title;
          location.userData.body = filteredAPIData[j].body;
          location.userData.link = filteredAPIData[j].link;
          // Generate lines
          let v = new THREE.Vector3(pos.x, pos.y, pos.z);
          let v2 = new THREE.Vector3(pos.x * 1.1, pos.y * 1.1, pos.z * 1.1);
          const geometry = new THREE.BufferGeometry().setFromPoints([v, v2]);
          const material = new THREE.LineBasicMaterial({ color: 0xf92435 });
          const line = new THREE.Line(geometry, material);
          this.earth.add(line);
          // Draw Curves
          // if (j < points.length - 1) {
          //   let posNext = this.convertLatLonToCartesian(points[j + 1].lat, points[j + 1].lon);
          //   this.getCurve(pos, posNext);
          // }
        }
      }, 3000);
    });

  }

  private convertLatLonToCartesian(lat, lon) {
    let phi = (90 - lat) * (Math.PI / 180);     // convert to radians (between 0 and 1)
    let theta = (lon + 180) * (Math.PI / 180);  // convert to radians

    let x = -(this.radius * Math.sin(phi) * Math.cos(theta));
    let y = this.radius * (Math.cos(phi));
    let z = this.radius * (Math.sin(phi) * Math.sin(theta));

    return { x, y, z };
  }

  // private getCurve(p1, p2) {
  //   let v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
  //   let v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
  //   let points: string[] = [];

  //   for (let i = 0; i <= 20; i++) {
  //     let p = new THREE.Vector3().lerpVectors(v1, v2, i / 20);
  //     p.normalize();
  //     //p.multiplyScalar(1 + 0.1 * Math.sin(Math.PI * i / 20));
  //     points.push(p);
  //   }

  //   let path = new THREE.CatmullRomCurve3(points);

  //   const geometry = new THREE.TubeGeometry(path, 20, 0.001, 8, false); // curve, tubularSegments, radius, radialSegments, closed
  //   const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  //   const curve = new THREE.Mesh(geometry, material);
  //   this.earth.add(curve);
  // }

  private rotateEarth(x, y) {
    this.earth.rotation.x += x / 1000000;
    this.earth.rotation.y += y / 1000000;
  }

  private resetTooltip() {
    for (let i = 0; i < this.earth.children.length; i++) {
      if (this.earth.children[i].material) {
        this.earth.children[i].material.opacity = 1.0;
      }
    }
  }

  private hoverTooltip() {
    this.raycaster.setFromCamera(this.rMouse, this.camera);
    let intersects = this.raycaster.intersectObjects(this.groupLocations.children);

    if (intersects.length > 0) {
      this.bRotateEarth = false;
      this.mouseDown = false;
      for (let i = 0; i < intersects.length; i++) {
        intersects[i].object.material.transparent = true;
        intersects[i].object.material.opacity = 0.5;
      }
    }
  }

  private startRenderingLoop() {
    let component: DashboardComponent = this;
    (function render() {
      requestAnimationFrame(render);
      if (component.bRotateEarth == true) {
        component.earth.rotation.y += component.rotationSpeedY;
      } else {
        gsap.to(component.groupRotate.rotation, {
          x: -component.mouse.y * 0.3,
          y: component.mouse.x * 0.5,
          duration: 2
        });
      }
      // Login
      if (component.bLoginOpen) {
        component.bRotateEarth = true;
        if(component.camera.zoom < 2.5) { // 1 bis 2.5
          component.camera.zoom += 0.1;
          component.camera.updateProjectionMatrix();
          if(component.camera.rotation.y <= 0.4) {
            component.camera.rotation.y += 0.025;
          }
        }
        if(component.camera.zoom > 2.5) {
          component.camera.zoom = 2.5;
          component.camera.rotation.y = 0.375;
          component.camera.updateProjectionMatrix();
          component.bLoginOpen = false;
        }
      }
      if (component.bLoginClose) {
        if(component.camera.zoom > 1) {
          component.camera.zoom -= 0.1;
          component.camera.updateProjectionMatrix();
        }
        if(component.camera.rotation.y > 0) {
          component.camera.rotation.y -= 0.025;
        }
        if(component.camera.zoom < 1) {
          component.camera.zoom = 1;
          component.camera.rotation.y = 0;
          component.camera.updateProjectionMatrix();
          component.bLoginClose = false;
        }
      }
      // About
      if (component.bAboutOpen) {
        component.bRotateEarth = true;
        if(component.camera.zoom < 2.5) { // 1 bis 2.5
          component.camera.zoom += 0.1;
          component.camera.updateProjectionMatrix();
          if(component.camera.rotation.y <= 0.4) {
            component.camera.rotation.y -= 0.025;
          }
        }
        if(component.camera.zoom > 2.5) {
          component.camera.zoom = 2.5;
          component.camera.rotation.y = -0.375;
          component.camera.updateProjectionMatrix();
          component.bAboutOpen = false;
        }
      }
      if (component.bAboutClose) {
        if(component.camera.zoom > 1) {
          component.camera.zoom -= 0.1;
          component.camera.updateProjectionMatrix();
        }
        if(component.camera.rotation.y < 0) {
          component.camera.rotation.y += 0.025;
        }
        if(component.camera.zoom < 1) {
          component.camera.zoom = 1;
          component.camera.rotation.y = 0;
          component.camera.updateProjectionMatrix();
          component.bAboutClose = false;
        }
      }
      component.resetTooltip();
      component.hoverTooltip();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  public displayDate() {
    const format_date = this.date.split("-");
    return format_date[2] + '.' + format_date[1] + '.' + format_date[0];
  }

  openFilterModal() {
    // this.modalCtl.open(FilterPopUpComponent);
    this.filterOptionsActive = true;
  }

  closeFilter() {
    this.filterOptionsActive = false;
  }

  login() {
    this.bLoginOpen = true;    // animate earth
    this.slideLoginActive = true;
    setTimeout(() => {
      const doc = document.getElementById('loginSlide');
      if (doc) {
        doc.style.transform = 'translateX(0%)';
      }
    }, 100);
  }

  closeLogin() {
    this.bLoginClose = true; // animate earth
    const doc = document.getElementById('loginSlide');
    if (doc) {
      doc.style.transform = 'translateX(-150%)';
    }
    setTimeout(() => {

      this.slideLoginActive = false;
    }, 1000);
  }

  about() {
    this.bAboutOpen = true; // animate earth
    this.slideAboutActive = true;
    setTimeout(() => {

      const doc = document.getElementById('aboutSlide');
      if (doc) {
        doc.style.transform = 'translateX(30%)';
      }
    }, 100);
  }

  closeAbout() {
    this.bAboutClose = true; // animate earth
    const doc = document.getElementById('aboutSlide');
    if (doc) {
      doc.style.transform = 'translateX(150%)';
    }
    setTimeout(() => {

      this.slideAboutActive = false;
    }, 1000);
  }

}