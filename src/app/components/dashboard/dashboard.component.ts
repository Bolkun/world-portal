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
import { MatDialog } from '@angular/material/dialog';
import { FilterPopUpComponent } from '../filter-pop-up/filter-pop-up.component';

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
  currentDate = this.getCurrentDate();
  apiData: any;
  // Canvas
  @ViewChild('canvas') private canvasRef!: ElementRef;
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  @Input() public rotationSpeedY: number = 0.0025;
  private bRotateEarth: boolean = true;
  private group = new THREE.Group();
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
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    })
  );
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private cameraAnngle = 70;
  private cameraZPosition = 3.0;
  private zoom = 0.2;
  // Bg
  private ang_rad = this.cameraAnngle * Math.PI / 180; 
  private fov_y = this.cameraZPosition * Math.tan(this.ang_rad / 2) * 2;
  private bgGalaxy = new THREE.Mesh(
    new THREE.PlaneGeometry(this.fov_y * window.innerWidth / window.innerHeight, this.fov_y),
    new THREE.MeshBasicMaterial( { 
      map: new THREE.ImageUtils.loadTexture('/assets/img/background.jpg'),
      transparent: true,
      opacity: 0.2
    } )
  );
  // Rotate earth
  private mouse = { x: 0, y: 0 };
  private last!: MouseEvent;
  private mouseDown: boolean = false;
  @HostListener('mouseup', ['$event']) onMouseup(event) {
    this.mouseDown = false;
    // animate earth rotation
    this.mouse.x = (event.clientX / innerWidth) * 4 - 1;
    this.mouse.y = -(event.clientY / innerHeight) * 4 + 1;
  }
  @HostListener('mouseout') onMouseout() {
    // Cursour leaves the window
    this.mouseDown = false;
  }
  @HostListener('mousemove', ['$event']) onMousemove(event: MouseEvent) {
    if (this.mouseDown) {
      // Stop earth rotation
      this.bRotateEarth = false;
      // Rotate earth on mousedown + mousemove
      this.earth.rotation.y += (event.clientX - this.last.clientX) / 400;
      this.earth.rotation.x += (event.clientY - this.last.clientY) / 400;
      // Save last position
      this.last = event;
      this.rotateEarth(this.last.clientX, this.last.clientY);
    }
  }
  @HostListener('mousedown', ['$event']) onMousedown(event) {
    this.mouseDown = true;
    this.last = event;
  }
  @HostListener('window:resize', ['$event']) onResize(event) {
    // Resize canvas
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  @HostListener("wheel", ["$event"]) onScroll(event: WheelEvent) {
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
    this.group.add(this.earth);
    this.scene.add(this.group);
    this.atmosphere.scale.set(1.1, 1.1, 1.1);
    this.scene.add(this.atmosphere);

    this.apiReliefwebService.getDisastersByDate(this.currentDate).subscribe((data) => {
      this.apiData = data;
      let points: any[] = [];
      
      setTimeout(() => {
        // Save lot, lan to object of arrays
        for (let i = 0; i < this.apiData.totalCount; i++) {
          if (this.apiData.data[i].fields.primary_country.location) {
            let pointObject: any = {
              lat: this.apiData.data[i].fields.primary_country.location.lat,
              lon: this.apiData.data[i].fields.primary_country.location.lon
            };
            points.push(pointObject);
          }
        }
        for (let j = 0; j < points.length; j++) {
          let pos = this.convertLatLonToCartesian(points[j].lat, points[j].lon);
          let location = new THREE.Mesh(
            new THREE.SphereBufferGeometry(0.005, 20, 20),
            new THREE.MeshBasicMaterial({ color: 0xf92435 })
          );
          location.position.set(pos.x, pos.y, pos.z);
          this.earth.add(location);
          // Lines
          let v = new THREE.Vector3(pos.x, pos.y, pos.z);
          let v2 = new THREE.Vector3(pos.x*1.1, pos.y*1.1, pos.z*1.1);

          const geometry = new THREE.BufferGeometry().setFromPoints([v, v2 ]);
          const material = new THREE.LineBasicMaterial({ color: 0xf92435 });
          const line = new THREE.Line(geometry, material);
          this.earth.add(line);
          // if (j < points.length - 1) {
          //   let posNext = this.convertLatLonToCartesian(points[j + 1].lat, points[j + 1].lon);
          //   this.getCurve(pos, posNext);
          // }
        }
      }, 1000);
    });

    this.camera = new THREE.PerspectiveCamera(this.cameraAnngle, window.innerWidth / window.innerHeight, 0.001, 1000);
    this.camera.position.z = this.cameraZPosition;
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

  private startRenderingLoop() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: DashboardComponent = this;
    (function render() {
      requestAnimationFrame(render);
      if (component.bRotateEarth == true) {
        component.earth.rotation.y += component.rotationSpeedY;
      } else {
        gsap.to(component.group.rotation, {
          x: -component.mouse.y * 0.3,
          y: component.mouse.x * 0.5,
          duration: 2
        });
      }
      component.renderer.render(component.scene, component.camera);
    }());
  }

  public getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
  }

  openFilterModal() {
    // this.modalCtl.open(FilterPopUpComponent);
    this.filterOptionsActive = true;
  }

  closeFilter() {
    this.filterOptionsActive = false;
  }

  login() {
    const doc = document.getElementById('custom-container');
    if (doc) {

      doc.style.transform = 'translateX(50%)';
      this.slideLoginActive = true;
    }
  }

  about() {
    const doc = document.getElementById('custom-container');
    if (doc) {

      doc.style.transform = 'translateX(-50%)';
      this.slideAboutActive = true;
    }
  }


  resetSlide() {
    const doc = document.getElementById('custom-container');
    if (doc) {

      doc.style.transform = 'translateX(0%)';
      this.slideLoginActive = false;
      this.slideAboutActive = false;
    }
  }

}