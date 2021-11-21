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
  @HostListener('window:resize', ['$event']) onResize(event) {
    event.target.innerWidth;
     // Camera frustum aspect ratio
     this.camera.aspect = window.innerWidth / window.innerHeight;;
     // After making changes to aspect
     this.camera.updateProjectionMatrix();
     // Reset size
     this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  constructor(
    public userService: UserService,
    public apiReliefwebService: ApiReliefwebService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.apiReliefwebService.getDisastersByDate(this.currentDate).subscribe((data)=>{
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

  private animateCube() {
    this.earth.rotation.y += this.rotationSpeedY;
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
      component.animateCube();
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
