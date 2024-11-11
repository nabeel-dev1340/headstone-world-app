import cemeteryData from "./cemeteries";

function getCemeteryNames(data) {
  return data.map((cemetery) => cemetery.CEMETERY_NAME);
}

function getCemeteryDataByName(name) {
  return cemeteryData.find((cemetery) => cemetery.CEMETERY_NAME === name);
}

const cemeteryNames = getCemeteryNames(cemeteryData);

export { cemeteryNames, getCemeteryDataByName };
