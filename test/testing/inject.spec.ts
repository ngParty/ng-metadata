import { expect } from 'chai';
import * as sinon from 'sinon';
import { inject } from '../../src/testing/inject';
import { Injectable } from '../../src/core/di/decorators';
import { noop, global } from '../../src/facade/lang';

describe(`testing/inject`, () => {
  describe(`inject`, () => {
    function mockAngularMockInject(mockInjectFn: any) {
      global.angular = { mock: {} } as any;
      global.angular.mock.inject = mockInjectFn as any;
    }

    it('should invoke angular mock inject', () => {
      const injectedVal = { text: 'This is injected' }
      mockAngularMockInject((fn: Function) => fn(injectedVal));

      const injectFn = sinon.spy();
      inject(['$window'], injectFn)

      expect( injectFn.calledWith( injectedVal ) ).to.equal( true )
    });

    it('should list the injectable tokens on the function', () => {
      const mockInjectFn = sinon.spy();
      mockAngularMockInject(mockInjectFn);

      @Injectable('MyInjectable')
      class MyInjectable {}

      inject(['$window', MyInjectable], noop);

      expect( mockInjectFn.args[0][0].$inject ).to.deep.equal(['$window', 'MyInjectable']);
    });
  });
});
