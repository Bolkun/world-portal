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
  // Sphere
  @Input() public rotationSpeedY: number = 0.0025;
  @Input() public size: number = 200;
  @Input() public texture: string = "/assets/img/earth.jpg";  // world-pointed.svg
  private bRotateEarth = true;
  // Stage
  @Input() public cameraZ: number = 400;
  @Input() public fieldOfView: number = 1;
  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 1000;
  // Helper
  private camera: THREE.PerspectiveCamera;
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  private loader = new THREE.TextureLoader();
  private geometry = new THREE.SphereGeometry(2, 32, 32);
  private material = new THREE.MeshBasicMaterial({ map: this.loader.load(this.texture) });
  private earth: THREE.Mesh = new THREE.Mesh(this.geometry, this.material);
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  // API
  currentDate = this.getCurrentDate();
  apiData: any;
  // Event
  // Resize canvas
  @HostListener('window:resize', ['$event']) onResize(event) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  // Rotate earth
  private last!: MouseEvent;
  private mouseDown: boolean = false;
  @HostListener('mouseup', ['$event']) onMouseup(event: MouseEvent) {
    // this.earth.rotation.y += (event.clientX - this.last.clientX) / 400;
    // this.earth.rotation.x += (event.clientY  - this.last.clientY) / 400;
    // this.last = event;
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
        this.animateEarth2(2,2);
      // setTimeout(() => {
        
        
      // }, 100);
      // this.onMouseup(this.last);
    }
  }
  @HostListener('mousedown', ['$event']) onMousedown(event) {
    this.mouseDown = true;
    this.last = event;
  }

  constructor(
    public userService: UserService,
    public apiReliefwebService: ApiReliefwebService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.apiReliefwebService.getDisastersByDate(this.currentDate).subscribe((data) => {
      this.apiData = data;  // Object
    });
  }

  ngAfterViewInit(): void {
    this.createScene();
    this.startRenderingLoop();
  }

  private createScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.add(this.earth);
    // Camera
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    this.camera.position.z = this.cameraZ;
  }

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private animateEarth() {
    if (this.bRotateEarth == true) {
      this.earth.rotation.y += this.rotationSpeedY;
    }
  }

  private animateEarth2(x, y) {
    setTimeout(() => {
      
      this.earth.rotation.y += this.rotationSpeedY*10;
    }, 100);
    this.bRotateEarth == false;
    // this.earth.rotation.x += this.rotationSpeedY;
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
