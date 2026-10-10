// BizOn — nạp model GLB tạo bằng Meshy AI, dùng chung cho mọi scene 3D.
// makeMeshyLoader(THREE) → { load(url), clone(url), flatten(root, color, opts) }.
// Chiến lược vật liệu: scene hiện tại 100% MeshStandardMaterial phẳng (không texture PBR) —
// flatten() thay material gốc của Meshy bằng vật liệu phẳng cùng tông để không lệch phong cách "đất sét".
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { clone as skeletonClone } from './vendor/SkeletonUtils.js';

export function makeMeshyLoader(THREE) {
  const loader = new GLTFLoader();
  const cache = {}; // url -> Promise<THREE.Object3D> (gltf.scene gốc, không chỉnh sửa, dùng làm khuôn để clone)

  function load(url) {
    return cache[url] ??= new Promise((resolve, reject) => {
      loader.load(url, gltf => resolve(gltf.scene), undefined, err => reject(err));
    });
  }

  // Trả về 1 bản sao độc lập (an toàn khi đặt nhiều lần trong scene, giữ nguyên skinning nếu có rig).
  async function clone(url) {
    const root = await load(url);
    const copy = skeletonClone(root);
    copy.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    return copy;
  }

  // Thay mọi material trong object3D bằng MeshStandardMaterial phẳng (màu + roughness do caller chỉ định),
  // giữ hình học/UV gốc của Meshy nhưng bỏ texture PBR nặng để khớp tông "đất sét" của các scene thủ công.
  function flatten(root, color, opts = {}) {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? 0.82, metalness: 0 });
    root.traverse(o => { if (o.isMesh) o.material = mat; });
    return root;
  }

  return { load, clone, flatten };
}
