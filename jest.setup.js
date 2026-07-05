/* eslint-env jest */

jest.mock('react-native-vision-camera', () => ({
  Camera: props => {
    const React = require('react');
    const { View } = require('react-native');

    return React.createElement(View, props);
  },
  useCameraDevice: () => ({ id: 'mock-camera-device', position: 'back' }),
  useCameraPermission: () => ({
    canRequestPermission: true,
    hasPermission: true,
    requestPermission: jest.fn(async () => true),
    status: 'authorized',
  }),
  usePhotoOutput: () => ({
    capturePhotoToFile: jest.fn(async () => ({
      filePath: '/tmp/mock-photo.jpg',
    })),
  }),
  usePreviewOutput: () => ({}),
}));
