import * as THREE from "https://cdn.skypack.dev/three@0.132.2"; 
// THREE.js kütüphanesini yüklüyor.

import { TrackballControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/TrackballControls.js"; 
// Trackball kontrollerini sağlamak için gerekli kütüphane.

import { OBJLoader } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/OBJLoader.js"; 
// 3D model yükleme işlemi için kullanılan kütüphane.

import { MeshSurfaceSampler } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/math/MeshSurfaceSampler.js"; 
// Mesh yüzeyi üzerinden rastgele nokta örnekleme işlemi için kullanılıyor.

window.THREE = THREE; 
// THREE.js değişkenini global olarak tanımlıyor.

const scene = new THREE.Scene(); 
// Sahneyi oluşturuyor.

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
); 
// Perspektif kamera tanımlıyor.

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
}); 
// Render işlemini gerçekleştiren WebGL Renderer oluşturuyor.

renderer.setSize(window.innerWidth, window.innerHeight); 
// Render boyutunu pencere boyutlarına göre ayarlıyor.

document.body.appendChild(renderer.domElement); 
// Renderer'ı HTML DOM'a ekliyor.

camera.position.z = 250; // Kamera pozisyonunun Z ekseni konumu.
camera.position.y = 100; // Kamera pozisyonunun Y ekseni konumu.

const controls = new TrackballControls(camera, renderer.domElement); 
// Trackball kontrollerini aktif ediyor.

controls.noPan = true; // Pan hareketini devre dışı bırakıyor.
controls.maxDistance = 700; // Kameranın maksimum uzaklaşma mesafesi.
controls.minDistance = 250; // Kameranın maksimum yakınlaşma mesafesi.
controls.rotateSpeed = 2; // Dünyanın döndürme hızını belirliyor.

const group = new THREE.Group(); 
// Nesneleri gruplayarak sahneye eklemek için bir grup oluşturuyor.

scene.add(group); 
// Grubu sahneye ekliyor.

group.rotation.y = 2; // Grubun başlangıçtaki Y ekseni rotasyonu.

let subgroups = []; 
// Alt grupları tutmak için bir dizi tanımlıyor.

let airplane = new THREE.Group(); 
// Uçak modelini tutmak için bir grup oluşturuyor.

new OBJLoader().load("https://assets.codepen.io/127738/Airplane_model2.obj", (obj) => {
  airplane = obj; // Uçak modeli yüklendiğinde gruba atanıyor.

  const mat = new THREE.MeshPhongMaterial({
    emissive: 0xffffff, // Uçak malzemesinin emisyon rengi.
    emissiveIntensity: 0.3 // Emisyon yoğunluğu.
  }); 

  airplane.children.forEach(child => {
    child.geometry.scale(0.013, 0.013, 0.013); 
    // Uçağın boyutunu küçültüyor.

    child.geometry.translate(0, 122, 0); 
    // Uçağı sahnede yukarı kaydırıyor.

    child.material = mat; 
    // Uçak materyalini atıyor.
  });

  let angles = [0.3, 1.3, 2.14, 2.6]; 
  // Alt grupların başlangıç açılarının dizisi.

  let speeds = [0.008, 0.01, 0.014, 0.02]; 
  // Alt grupların dönüş hızları.

  let rotations = [0, 2.6, 1.5, 4]; 
  // Alt grupların başlangıçtaki rotasyonları.

  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group(); 
    // Her alt grup için bir grup oluşturuyor.

    g.speed = speeds[i]; 
    // Her alt grubun hızını belirliyor.

    subgroups.push(g); 
    // Alt grubu subgroups dizisine ekliyor.

    group.add(g); 
    // Alt grubu ana gruba ekliyor.

    const g2 = new THREE.Group(); 
    // Alt grupların içinde bir grup daha oluşturuyor.

    let _airplane = airplane.clone(); 
    // Uçak modelinin bir kopyasını oluşturuyor.

    g.add(g2); 
    g2.add(_airplane); 
    // Uçak modelini iç içe geçmiş gruplara ekliyor.

    g2.rotation.x = rotations[i]; 
    // Grubun X ekseni rotasyonunu ayarlıyor.

    g.rotation.y = angles[i]; 
    // Grubun Y ekseni rotasyonunu ayarlıyor.

    g.reverse = i < 2; 
    // İlk iki grubun uçağını ters döndürüyor.

    if (i < 2) {
      _airplane.children[0].geometry = airplane.children[0].geometry.clone().rotateY(Math.PI); 
      // İlk iki uçak modelini ters çeviriyor.
    }
  }
});

let sampler = []; 
// Mesh yüzeyinde örneklemeler yapmak için bir örnekleyici tanımlıyor.

let earth = null; 
// Dünya modelini saklamak için bir değişken oluşturuyor.

let paths = []; 
// Yolları saklamak için bir dizi oluşturuyor.

new OBJLoader().load(
  "https://assets.codepen.io/127738/NOVELO_EARTH.obj", 
  (obj) => {
    earth = obj.children[0]; 
    // Dünya modelini yüklüyor.

    earth.geometry.scale(0.35, 0.35, 0.35); 
    // Dünya modelinin boyutunu ayarlıyor.

    earth.geometry.translate(0, -133, 0); 
    // Dünya modelini sahnede aşağı kaydırıyor.

    let positions = Array.from(earth.geometry.attributes.position.array).splice(0, 3960 * 3); 
    // Toprağın konum bilgilerini alıyor.

    const landGeom = new THREE.BufferGeometry(); 
    // Toprak geometrisini oluşturuyor.

    landGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); 
    const land = new THREE.Mesh(landGeom); 

    positions = Array.from(earth.geometry.attributes.position.array).splice(3960 * 3, 540 * 3); 
    const waterGeom = new THREE.BufferGeometry(); 
    waterGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); 
    waterGeom.computeVertexNormals(); 
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x0da9c3, transparent: true, opacity: 1 }); 
    const water = new THREE.Mesh(waterGeom, waterMat); 
    group.add(water); 

    const light = new THREE.HemisphereLight(0xccffff, 0x000033, 1); 
    scene.add(light); 

    sampler = new MeshSurfaceSampler(land).build(); 

    for (let i = 0; i < 24; i++) {
      const path = new Path(); 
      paths.push(path); 
      group.add(path.line); 
    }

    renderer.setAnimationLoop(render); 
  }
);

const tempPosition = new THREE.Vector3(); 
// Geçici konumları tutmak için vektör.

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xbbde2d, 
  transparent: true, 
  opacity: 0.6 
}); 
// Çizgilerin görünümünü belirliyor.

class Path {
  constructor() {
    this.geometry = new THREE.BufferGeometry(); 
    this.line = new THREE.Line(this.geometry, lineMaterial); 
    this.vertices = []; 

    sampler.sample(tempPosition); 
    this.previousPoint = tempPosition.clone(); 
  }

  update() {
    let pointFound = false; 
    while (!pointFound) {
      sampler.sample(tempPosition); 
      if (tempPosition.distanceTo(this.previousPoint) < 12) {
        this.vertices.push(tempPosition.x, tempPosition.y, tempPosition.z); 
        this.previousPoint = tempPosition.clone(); 
        pointFound = true; 
      }
    }
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.vertices, 3)); 
  }
}

const look = new THREE.Vector3(0, 0, 0); 
// Kameranın odaklanacağı noktayı belirliyor.

function render(a) {
  group.rotation.y += 0.001; 

  subgroups.forEach(g => {
    g.children[0].rotation.x += (g.speed * (g.reverse ? -1 : 1)); 
  });

  paths.forEach(path => {
    if (path.vertices.length < 35000) {
      path.update(); 
    }
  });

  controls.update(); 
  renderer.render(scene, camera); 
}

window.addEventListener("resize", onWindowResize, false); 
// Pencere boyutları değiştiğinde çalışır.

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight; 
  camera.updateProjectionMatrix(); 
  renderer.setSize(window.innerWidth, window.innerHeight); 
}






























































































// instagram/lweaxo