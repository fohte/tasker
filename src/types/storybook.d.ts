import '@storybook/react';

declare module '@storybook/react' {
  export interface StoryObj<T = any> {
    mockState?: any;
    parameters?: any;
    play?: any;
  }

  export interface ArgTypes<T = any> {
    mockState?: any;
  }
}