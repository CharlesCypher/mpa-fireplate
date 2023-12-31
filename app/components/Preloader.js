import gsap from "gsap";
import Component from "classes/Component";
import { MeshBasicMaterial, TextureLoader, sRGBEncoding } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default class Preloader extends Component {
  constructor() {
    super({
      element: ".preloader",
    });
    this.length = 0;
    this.limit = 100;
    this.assets = preloadables;
    this.create();
  }

  create() {
    const textureLoader = new TextureLoader();
    const gltfLoader = new GLTFLoader();
    const images = this.assets.images;
    const videos = this.assets.videos;
    Canvas.textures = {};
    Canvas.materials = {};
    Canvas.exports = {};
    images.forEach((src) => {
      const image = new Image();
      image.src = src;
      image.onload = () => this.onAssetLoaded();
    });
    videos.forEach((src) => {
      const video = document.createElement("video");
      video.src = src;
    });
    Object.entries(this.assets.textures).forEach(([name, src]) => {
      textureLoader.load(src, (texture) => {
        const map = texture;
        map.flipY = false;
        map.encoding = sRGBEncoding;
        if (name === "about") Canvas.textures[name] = texture;
        else
          Canvas.materials[name] = new MeshBasicMaterial({
            map,
            transparent: true,
            opacity: 0,
          });
        this.onAssetLoaded();
      });
    });
    Object.entries(this.assets.exports).forEach(([name, src]) => {
      gltfLoader.load(src, (group) => {
        Canvas.exports[name] = group.scene;
        this.onAssetLoaded();
      });
    });
  }
  onAssetLoaded() {
    this.length += 1;
    const percentage = Math.round(
      (this.length /
        (this.assets.images.length +
          Object.values(this.assets.textures).length +
          Object.values(this.assets.exports).length)) *
        this.limit
    );
    if (percentage === this.limit) this.onCompleted();
  }

  async onCompleted() {
    //leave animation
    this.dispatchEvent({ type: "preloaded" });
    this.destroy();
  }

  destroy() {
    this.element.parentElement.removeChild(this.element);
  }
}
