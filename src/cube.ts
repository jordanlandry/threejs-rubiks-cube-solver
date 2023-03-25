import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import properties, { INITIAL_CUBE_STATE } from "../properties";
import Face from "./face";
import scramble from "./functions/scramble";
import solve from "./functions/solve";
import turn from "./functions/turn";
import interpretMoves from "./helpers/interpretMoves";
import { sleep } from "./helpers/sleep";
import { scene } from "./main";

export default function Cube() {
  const { totalSize, borderSize } = properties;
  const innerCubeSize = totalSize + borderSize - 0.01; // Makes the cube slightly smaller than the total size

  // Create a black cube as the inner cube
  const innerCube = new Mesh(new BoxGeometry(innerCubeSize, innerCubeSize, innerCubeSize), new MeshBasicMaterial({ color: 0x000000 }));

  let cubeState = INITIAL_CUBE_STATE;

  // Create the faces of the cube
  const faces = [] as any;
  function updateElements(firstTime = false) {
    if (!firstTime) {
      scene.remove(...faces);
      faces.length = 0;
    }

    Object.values(cubeState).forEach((side, index) => {
      const faceMesh = new Mesh();

      const face = Face({ id: index, state: side });

      // Add the planes of the face to the face mesh (will always be 1 mesh)
      faceMesh.add(face.elements[0]);

      const rotation = {
        x: index === 0 ? Math.PI / 2 : index === 1 ? -Math.PI / 2 : 0,
        y: index === 3 ? Math.PI / 2 : index === 4 ? -Math.PI / 2 : index === 5 ? Math.PI : 0,
        z: 0,
      };

      faceMesh.rotation.set(rotation.x, rotation.y, rotation.z);
      faces.push(faceMesh);
    });

    if (!firstTime) scene.add(...faces);
  }

  async function handleKeyDown(e: KeyboardEvent) {
    if (e.key === " ") {
      const scrambleSequence = scramble();

      for (let i = 0; i < scrambleSequence.length; i++) {
        const { move, inverted } = scrambleSequence[i];
        await turn(cubeState, move, inverted);

        updateElements();

        await sleep(properties.animationSpeed);
      }
    }

    if (e.key === "Enter") {
      const solveSequence = interpretMoves(await solve(cubeState));

      for (let i = 0; i < solveSequence.length; i++) {
        const { move, inverted } = solveSequence[i];
        await turn(cubeState, move, inverted);

        updateElements();

        await sleep(properties.animationSpeed);
      }
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  updateElements(true);

  const faceElements = { elements: faces };

  return { elements: [innerCube, faceElements] };
}
