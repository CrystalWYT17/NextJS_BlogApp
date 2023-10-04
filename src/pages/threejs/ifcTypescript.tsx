import React from "react";
import * as OBC from "openbim-components";
import * as THREE from "three";

const IfcViewer = () => {
  const [modelCount, setModelCount] = React.useState(0);

  React.useEffect(() => {
    showIfc();
  }, []);

  async function showIfc() {
    const viewer = new OBC.Components();

    const sceneComponent = new OBC.SimpleScene(viewer);
    viewer.scene = sceneComponent;
    const scene = sceneComponent.get();
    const ambientLight = new THREE.AmbientLight(0xe6e7e4, 1);
    const directionalLight = new THREE.DirectionalLight(0xf9f9f9, 0.75);
    directionalLight.position.set(10, 50, 10);
    scene.add(ambientLight, directionalLight);
    scene.background = new THREE.Color("#202932");

    const viewerContainer = document.getElementById(
      "viewerContainer"
    ) as HTMLDivElement;
    const rendererComponent = new OBC.PostproductionRenderer(
      viewer,
      viewerContainer
    );
    viewer.renderer = rendererComponent;

    const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer);
    viewer.camera = cameraComponent;

    const raycasterComponent = new OBC.SimpleRaycaster(viewer);
    viewer.raycaster = raycasterComponent;

    viewer.init();
    cameraComponent.updateAspect();
    rendererComponent.postproduction.enabled = true;

    // new OBC.SimpleGrid(viewer, new THREE.Color(0x666666));

    const fragmentManager = new OBC.FragmentManager(viewer);
    const ifcLoader = new OBC.FragmentIfcLoader(viewer);
    ifcLoader.settings.wasm = {
      path: "https://unpkg.com/web-ifc@0.0.43/",
      absolute: true,
    };

    ifcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
    ifcLoader.settings.webIfc.OPTIMIZE_PROFILES = true;

    const highlighter = new OBC.FragmentHighlighter(viewer);
    highlighter.setup();
    const highlightMeaterial = new THREE.MeshBasicMaterial({
      color: "#BCF124",
      depthTest: false,
      opacity: 1,
      transparent: false,
    });
    // highlighter.add("highlight", [highlightMeaterial]);

    const highlightMeaterial1 = new THREE.MeshBasicMaterial({
      color: "#E73F1B",
      depthTest: false,
      opacity: 1,
      transparent: false,
    });

    highlighter.add("highlight", [highlightMeaterial]);
    highlighter.add("error", [highlightMeaterial1]);
    highlighter.update();

    // model tree
    const modelTree = new OBC.FragmentTree(viewer);
    modelTree.init();

    const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer);
    highlighter.events.select.onClear.add(() => {
      propertiesProcessor.cleanPropertiesList();
    });

    const file = await fetch("/resources/Model2Revit.ifc");
    const dataBlob = await file.arrayBuffer();
    const buffer = new Uint8Array(dataBlob);
    const model = await ifcLoader.load(buffer, "ifcFile");
    scene.add(model);

    console.log("model:", model);

    // const properties = await fetch("/resources/Model2Revit.json");
    // model.properties = await properties.json();

    // const property1: any = JSON.stringify(model.properties);
    const property: any = model.properties;

    // const myProperty = OBC.IfcPropertiesManager.getIFCInfo(model);
    // const arr = JSON.stringify(myProperty.properties);

    // console.log("detall:", arr);

    // console.log("pro:", ifcProperty);
    // console.log("pro1:", property1["1"]);

    // for (const item of property1) {
    //   console.log(item);
    // }

    // const ifcFile = await ifcLoader.load(buffer, "ifcFile");

    if (model) {
      setModelCount(fragmentManager.groups.length);

      // const fragmentMeshList = model.children;
      // const mesh1 = fragmentMeshList[0];
      // highlighter.highlightByID("highlight", mesh1);

      let guidList = [
        "1b$Es3XdH5ogU5mnCDkZWq",
        "10LUbXLKz2JOlt9Hh9H76W",
        "10LUbXLKz2JOlt9Hh9H78v",
        "10LUbXLKz2JOlt9Hh9H79P",
      ];

      // found case
      for (const guid of guidList) {
        console.log("guid:", guid);
        const item: any = OBC.IfcPropertiesUtils.findItemByGuid(property, guid);
        if (item) {
          // const removeIndx = guidList.indexOf(guid);
          // guidList = guidList.splice(removeIndx - 1, 1);
          //if found
          const expressId = item.expressID as number;

          // const pset = OBC.IfcPropertiesUtils.getPsetProps(property, expressId);
          // console.log(pset);

          const found = model.getFragmentMap([expressId]);
          const result: OBC.FragmentIdMap = {};
          console.log("found:", found);

          for (const fragmentId in found) {
            const expressIds = new Set<string>();
            const expressIdsInNumber = found[fragmentId];
            for (const expressIdInNumber of expressIdsInNumber) {
              expressIds.add(expressIdInNumber.toString());
            }
            result[fragmentId] = expressIds;
          }
          highlighter.highlightByID("highlight", result, false, false);
        } else {
          const item: any = OBC.IfcPropertiesUtils.findItemByGuid(
            property,
            "05sdoJVOTDUAjSxdePGWx2"
          );
          const expressId = item.expressID as number;
          const found = model.getFragmentMap([expressId]);
          const result: OBC.FragmentIdMap = {};
          console.log("found1:", found);

          for (const fragmentId in found) {
            const expressIds = new Set<string>();
            const expressIdsInNumber = found[fragmentId];
            for (const expressIdInNumber of expressIdsInNumber) {
              expressIds.add(expressIdInNumber.toString());
            }
            result[fragmentId] = expressIds;
          }
          highlighter.highlightByID("error", result, false, false);
        }
      }
      console.log(guidList);

      //not found case

      // for (const indx in property) {
      //   console.log(indx);
      //   for (const guid of guidList) {
      //     console.log("guid:", guid);
      //     const item: any = OBC.IfcPropertiesUtils.findItemByGuid(
      //       property,
      //       guid
      //     );
      //     if (item) {
      //       //if found
      //       const expressId = item.expressID as number;
      //       const found = model.getFragmentMap([expressId]);
      //       const result: OBC.FragmentIdMap = {};
      //       let fragment: OBC.FragmentIdMap | any;
      //       console.log("found:", found);

      //       for (const fragmentId in found) {
      //         const expressIds = new Set<string>();
      //         const expressIdsInNumber = found[fragmentId];
      //         for (const expressIdInNumber of expressIdsInNumber) {
      //           expressIds.add(expressIdInNumber.toString());
      //         }
      //         result[fragmentId] = expressIds;
      //       }
      //       console.log("fragment:", fragment);
      //       highlighter.highlightByID("highlight", result, false, false);
      //     }
      //   }
      // }

      // const item: any = OBC.IfcPropertiesUtils.findItemByGuid(
      //   property,
      //   "1b$Es3XdH5ogU5mnCDkZWq"
      // );

      // const expressId = item.expressID as number;
      // const found = model.getFragmentMap([expressId]);
      // const result: OBC.FragmentIdMap = {};
      // let fragment: OBC.FragmentIdMap | any;
      // console.log("found:", found);

      // for (const fragmentId in found) {
      //   // if (fragmentId == child.uuid) {
      //   //   fragmentMeshResult = child;
      //   //   fragment = fragmentId;
      //   // }
      //   const expressIds = new Set<string>();
      //   const expressIdsInNumber = found[fragmentId];
      //   for (const expressIdInNumber of expressIdsInNumber) {
      //     expressIds.add(expressIdInNumber.toString());
      //   }
      //   result[fragmentId] = expressIds;
      // }
      // console.log("fragment:", fragment);
      // highlighter.highlightByID("highlight", result, false, false);
      // highlighter.clear();

      // for (const fragmentId in found) {
      //   const expressIds = new Set<string>();
      //   const expressIdsInNumber = found[fragmentId];
      //   for (const expressIdInNumber of expressIdsInNumber) {
      //     expressIds.add(expressIdInNumber.toString());
      //   }
      //   result[fragmentId] = expressIds;
      // }
      // console.log("res:", result);

      // highlighter.highlightByID("highlight", result, true, true);

      // let fragment: OBC.FragmentIdMap | any;

      // propertiesProcessor.process(model);
      // highlighter.events.select.onHighlight.add((selection) => {
      //   const fragmentID = Object.keys(selection)[0];
      //   const expressID = Number([...selection[fragmentID]][0]);
      //   propertiesProcessor.renderProperties(model, expressID);
      //   // highlighter.highlightByID("highlight", selection, false, true);
      // });

      // highlighter.highlightByID("highlight", fragment, false, true);

      highlighter.update();
    }

    // ifcLoader.onIfcLoaded.add((model) => {
    //   setModelCount(fragmentManager.groups.length);

    //   // const fragmentMeshList = model.children;
    //   // const mesh1 = fragmentMeshList[0];
    //   // highlighter.highlightByID("highlight", mesh1);

    //   const item: any = OBC.IfcPropertiesUtils.findItemByGuid(
    //     model.properties!,
    //     "1b$Es3XdH5ogU5mnCDkZWq"
    //   );

    //   const expressId = item.expressID as number;
    //   const found = model.getFragmentMap([expressId]);
    //   const result: OBC.FragmentIdMap = {};
    //   let fragment: OBC.FragmentIdMap | any;
    //   console.log("found:", found);

    //   // for (const fragmentId in found) {
    //   //   const expressIds = new Set<string>();
    //   //   const expressIdsInNumber = found[fragmentId];
    //   //   for (const expressIdInNumber of expressIdsInNumber) {
    //   //     expressIds.add(expressIdInNumber.toString());
    //   //   }
    //   //   result[fragmentId] = expressIds;
    //   // }
    //   // highlighter.highlightByID("highlight", result, true, true);

    //   // let fragment: OBC.FragmentIdMap | any;

    //   propertiesProcessor.process(model);
    //   highlighter.events.select.onHighlight.add((selection) => {
    //     const fragmentID = Object.keys(selection)[0];
    //     const expressID = Number([...selection[fragmentID]][0]);
    //     propertiesProcessor.renderProperties(model, expressID);
    //     fragment = selection;
    //     // highlighter.highlightByID("highlight", selection, false, true);
    //   });

    //   console.log("fragment:", fragment);

    //   highlighter.highlightByID("highlight", fragment, false, true);

    //   highlighter.update();
    // });

    // const mainToolbar = new OBC.Toolbar(viewer);
    // mainToolbar.addChild(
    //   ifcLoader.uiElement.get("main"),
    //   propertiesProcessor.uiElement.get("main")
    // );
    // viewer.ui.addToolbar(mainToolbar);
  }

  const viewerContainerStyle: React.CSSProperties = {
    width: "50%",
    height: "50%",
    position: "fixed",
    padding: "20px 20px ",
  };

  const titleStyle: React.CSSProperties = {
    position: "absolute",
    top: "15px",
    left: "15px",
  };

  return (
    <>
      <div id="viewerContainer" style={viewerContainerStyle}>
        {/* <h3 style={titleStyle}>Models loaded: {modelCount}</h3> */}
      </div>
    </>
  );
};

export default IfcViewer;
