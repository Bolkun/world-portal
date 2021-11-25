import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, HostListener } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ApiReliefwebService } from 'src/app/services/api-reliefweb.service';
import { Router } from "@angular/router";
import * as THREE from 'three';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit, AfterViewInit {
  // Canvas
  @ViewChild('canvas') private canvasRef!: ElementRef;
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  @Input() public rotationSpeedX: number = 0.0025;
  @Input() public rotationSpeedY: number = 0.0025;
  private bRotateEarth: boolean = true;
  private map: string = "/assets/img/earth.jpg"; // world-pointed-white.png
  private radius = 1;
  private geometry = new THREE.SphereBufferGeometry(this.radius, 30, 30); // radius, widthSegments, heightSegments
  private material = new THREE.MeshBasicMaterial({ 
    map: new THREE.TextureLoader().load(this.map),
    // transparent: true
  });
  private earth = new THREE.Mesh(this.geometry, this.material);
  private mesh = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.01, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  private mesh1 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.01, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private cameraZPosition = 4.0;
  private zoom = 1.0;
  // API
  currentDate = this.getCurrentDate();
  apiData: any;
  // Rotate earth
  private last!: MouseEvent;
  private mouseDown: boolean = false;
  @HostListener('mouseup') onMouseup() {
    this.mouseDown = false;
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
      this.animateSmoothEarth(this.last.clientX, this.last.clientY);
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
    public router: Router
  ) {}

  ngOnInit(): void {
    this.apiReliefwebService.getDisastersByDate(this.currentDate).subscribe((data) => {
      this.apiData = data;  // Object
    });
  }

  ngAfterViewInit(): void {
    this.createScene();
    this.startRenderingLoop();
  }

  private convertLatLngToCartesian(p) {
    let phi = (90-p.lat) * (Math.PI/180);  // convert to radians (between 0 and 1)
    let theta = (p.lng+180) * (Math.PI/180);  // convert to radians
    
    let x = -(Math.sin(phi)*Math.cos(theta));
    let y = (Math.cos(phi));
    let z = (Math.sin(phi)*Math.sin(theta));

    return { x, y, z };
  }

  private getCurve(p1, p2) {
    let v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
    let v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
    let points: string[] = [];

    for (let i=0; i<=20; i++) {
      let p = new THREE.Vector3().lerpVectors(v1, v2, i/20);
      p.normalize();
      p.multiplyScalar(1 + 0.1*Math.sin(Math.PI*i/20));
      points.push(p);
    }

    let path = new THREE.CatmullRomCurve3(points);

    const geometry = new THREE.TubeGeometry(path, 20, 0.001, 8, false); // curve, tubularSegments, radius, radialSegments, closed
    const material = new THREE.MeshBasicMaterial({color: 0x0000ff});
    const curve = new THREE.Mesh(geometry, material);
    this.earth.add(curve);
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.add(this.earth);

    // spherical coordinates
    let point1 = {  // Los Angeles
      lat: 34.0522,  // N
      lng: -118.2437 // W -
    }

    // let point2 = {  // Kyiv
    //   lat: 50.4501, // N
    //   lng: 30.5234  // E
    // }

    let point2 = {  // Windhoek (Namibia)
      lat: -22.5609, // N (if E, than -N)
      lng: 17.0658   // E 
    }

    let pos = this.convertLatLngToCartesian(point1);
    let pos1 = this.convertLatLngToCartesian(point2);
    this.getCurve(pos, pos1);
   
    // add pin
    this.mesh.position.set(pos.x, pos.y, pos.z);  // cartesian coordinates
    this.mesh1.position.set(pos1.x, pos1.y, pos1.z);

    this.earth.add(this.mesh);
    this.earth.add(this.mesh1);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.camera.position.z = this.cameraZPosition;
  }

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private animateEarth() {
    if (this.bRotateEarth == true) {
      this.earth.rotation.y += this.rotationSpeedY;
    }
  }

  private animateSmoothEarth(x, y) {
    setTimeout(() => {
      this.earth.rotation.x += x / 1000000;
      this.earth.rotation.y += y / 1000000;
    }, 100);
  }

  private startRenderingLoop() {
    // Renderer
    // Use canvas element in template
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: DashboardComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animateEarth();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
  }

}
