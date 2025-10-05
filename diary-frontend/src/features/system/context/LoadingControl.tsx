// src/context/LoadingControl.ts
type LoadingControl = {
  showLoading: () => void;
  hideLoading: () => void;
};

let control: LoadingControl = {
  showLoading: () => {},
  hideLoading: () => {},
};

export const setLoadingControl = (externalControl: LoadingControl) => {
  control = externalControl;
};

export const getLoadingControl = () => control;
