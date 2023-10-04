"use client";
import { useEffect, useState } from "react";
import * as THREE from "three";
import * as OBC from "openbim-components";
import * as dat from "three/examples/jsm/libs/lil-gui.module.min";

function IfcFragment() {
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // showIfc();
  }, []);

  async function handleUpload() {
    // if (!selectedFile) return;
    showIfc();
  }

  function handleFileChange(e) {
    console.log("file:", e.target.files[0].name);
    setSelectedFile(e.target.files[0]);
  }

  function showIfc() {
    const container = document.getElementById("container");
    const canvas = document.getElementById("mycanvas");

    const components = new OBC.Components();
    components.scene = new OBC.SimpleScene(components);
    // // components.renderer = new OBC.PostproductionRenderer(components, container);
    components.renderer = new OBC.SimpleRenderer(components, container, {
      antialias: true,
      canvas,
    });
    components.camera = new OBC.SimpleCamera(components);
    components.raycaster = new OBC.SimpleRaycaster(components);
    components.init();

    // // components.renderer.controls.postproduction.enabled = true;

    // const scene = components.scene.get();

    // components.camera.controls.setLookAt(20, 10, 20, 2, 2, 2);

    // components.scene.setup();
    // const renderer = components.renderer.get();
    // renderer.setSize(window.innerWidth, innerHeight);

    const fragmentIfcLoader = new OBC.FragmentIfcLoader(components);

    const mainToolbar = new OBC.Toolbar(components, {
      name: "Main Toolbar",
      position: "bottom",
    });
    components.ui.addToolbar(mainToolbar);
    const ifcButton = fragmentIfcLoader.uiElement;
    mainToolbar.addChild(ifcButton);

    fragmentIfcLoader.settings.wasm = {
      path: "https://unpkg.com/web-ifc@0.0.43/",
      absolute: true,
    };

    fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
    fragmentIfcLoader.settings.webIfc.OPTIMIZE_PROFILES = true;

    async function loadIfcAsFragments() {
      const file = await fetch("/resources/Model2Revit.ifc");
      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const model = await fragmentIfcLoader.load(buffer);
      scene.add(model);
    }
  }

  return (
    <div>
      <div id="container">
        <canvas id="mycanvas"></canvas>
      </div>
      <input accept=".ifc" type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload File</button>
    </div>
  );
}

export default IfcFragment;
