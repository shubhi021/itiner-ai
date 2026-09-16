import 'react-native';
import React from 'react';
import App from '../App';
import {it, describe, expect, beforeEach, afterEach} from '@jest/globals';
import renderer, {act} from 'react-test-renderer';

describe('App Root', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders root application without crashing', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<App />);
    });
    expect(tree).toBeDefined();
  });
});
