import './style.css'
import * as THREE from 'three'
import { Pane } from 'tweakpane'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})



/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(64, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Cube
 */

// Geometries
const baseGeometry = new THREE.PlaneGeometry(10 , 10 , 10 , 10).rotateX(-Math.PI / 2)
const parkDummyGeometry = new THREE.BoxGeometry(.5 , .5 , 1)

// Materials
const baseMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x575757,

    roughness: 0
})
const parkDummyMaterial = new THREE.MeshPhongMaterial({
    color:0x0000ff,
    wireframe: true
})


// Meshes
const basePlane = new THREE.Mesh(
    baseGeometry,
    baseMaterial,
)
basePlane.position.y -= .25
basePlane.receiveShadow = true

const parkDummy = new THREE.Mesh(
    parkDummyGeometry,
    parkDummyMaterial
)

let carModel = new THREE.Group();

new GLTFLoader().load('/Car.glb' , (gltf) =>
{
    const model = gltf.scene
    model.scale.set(.5 , .5 , .5)

    model.position.y -= .075
    model.position.x = -4
    model.position.z = -4

    model.traverse((o) =>
    {
        o.castShadow = true
    })

    scene.add(model)

    carModel = model
})


scene.add( basePlane , parkDummy )


/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight()
const directionalLight = new THREE.DirectionalLight(0xffffff , 1.5)

directionalLight.position.set( 10 , 10 , 10 )
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set( 4096 , 4096 )

scene.add( ambientLight , directionalLight )

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.shadowMap.enabled = true
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    controls.update()

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)

    /**
     * Moving conditions
    */
    const xPosCondition = carModel.position.x < parkDummy.position.x
    const zPosCondition = carModel.position.z < parkDummy.position.z && !xPosCondition

    const xNegCondition = carModel.position.x > parkDummy.position.x
    const zNegCondition = carModel.position.z > parkDummy.position.z && !xNegCondition


    if (xPosCondition) 
    {
        carModel.position.x += 0.05
        carModel.rotation.y = Math.PI / 2
    }
    if (zPosCondition) 
    {
        carModel.position.z += 0.05
        carModel.rotation.y = 0
    }

    // if (xNegCondition) 
    // {
    //     carModel.position.x -= 0.05
    //     carModel.rotation.y = -Math.PI / 2
    // }
    // if (zNegCondition) 
    // {
    //     carModel.position.z -= 0.05
    //     carModel.rotation.y = -Math.PI
    // }
}

tick()

/**
 * debug
 */

const debug = new Pane()
debug.containerElem_.style.width = '350px'

const parkFolder = debug.addFolder({
    title: 'park'
})

parkFolder.addInput(
    parkDummy.position,
    'x',
    { min: -5 , max: 5 }
)
parkFolder.addInput(
    parkDummy.position,
    'z',
    { min: -5 , max: 5 }
)