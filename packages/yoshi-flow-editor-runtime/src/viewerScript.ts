import { IWidgetControllerConfig } from '@wix/native-components-infra/dist/es/src/types/types';
import { createInstances, objectPromiseAll, fetchFrameworkData } from './utils';

let frameworkData: any;

export const createControllers = (
  createController: Function,
  initApp: Function,
) => (controllerConfigs: Array<IWidgetControllerConfig>) => {
  const wrappedControllers = controllerConfigs.map(controllerConfig => {
    const { appParams, platformAPIs, wixCodeApi } = controllerConfig;

    initializeExperiments();

    const appData = initApp({
      controllerConfigs,
      frameworkData,
      appParams,
      platformAPIs,
      wixCodeApi,
    });

    const { setProps } = controllerConfig;

    const setState = (newState: any) => {
      const updatedState = {
        ...context.state,
        ...newState,
      };

      // Track state
      context.state = updatedState;

      // Run state change callback
      wrappedController.then((userController: any) => {
        userController.stateChange();
      });

      // Update render cycle
      return setProps(updatedState);
    };

    const context = {
      state: {},
      setState,
    };

    const userControllerPromise = createController.call(context, {
      controllerConfig,
      frameworkData,
      appData,
    });

    const wrappedController = Promise.resolve(userControllerPromise).then(
      (userController: any) => {
        return {
          ...userController,
          pageReady: async (...args: Array<any>) => {
            const awaitedFrameworkData = await objectPromiseAll(frameworkData);

            setProps({
              __publicData__: controllerConfig.config.publicData,
              ...awaitedFrameworkData,
              // Set initial state
              ...context.state,
              // Set methods
              ...userController.methods,
            });

            // Optional `pageReady`
            if (userController.pageReady) {
              return userController.pageReady(setProps, ...args);
            }
          },
        };
      },
    );
    return wrappedController;
  });

  return wrappedControllers;
};

const initializeExperiments = () => {
  frameworkData = fetchFrameworkData();

  // TODO: Generalize
  frameworkData.experimentsPromise = frameworkData.experimentsPromise.then(
    (experiments: any) => createInstances({ experiments }),
  );
};

export const initAppForPage = async () =>
  // initParams,
  // platformApis,
  // scopedSdkApis,
  // platformServicesApis,
  {};
