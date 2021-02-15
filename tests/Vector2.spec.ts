import 'mocha';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiRoughly from 'chai-roughly';
import Vector2 from '../src/Vector2';

chai.use(chaiRoughly);

describe('Vector2', () => {

  describe('fromArray', () => {

    it('should return a Vector2 based on an array of two numbers', () => {
      expect(Vector2.fromArray([1, 2])).to.deep.equal(new Vector2(1, 2));
    });

    it('should throw an error when arr.length is not 2', () => {
      expect(Vector2.fromArray.bind(this, [1])).to.throw("arr' length must be 2.");
    });

  });

  describe('dot', () => {

    it('should return the dot product of two vectors', () => {
      expect(Vector2.dot(new Vector2(1, 0), new Vector2(0, 1))).to.equal(0);
      expect(Vector2.dot(new Vector2(0, 1), new Vector2(0, -1))).to.equal(-1);
      expect(Vector2.dot(new Vector2(0, 1), new Vector2(0, 1))).to.equal(1);
    });

  });

  describe('distance', () => {

    it('should return the distance between two positions', () => {
      expect(Vector2.distance(new Vector2(0, 0), new Vector2(-2, 0))).to.equal(2);
      expect(Vector2.distance(new Vector2(0, -1), new Vector2(0, 1))).to.equal(2);
    });

  });

  describe('angleBetween', () => {

    it('should return the signed acute angle in radians between two directions', () => {
      expect(Vector2.angleBetween(new Vector2(1, 0), new Vector2(0, 1))).to.equal(Math.PI / 2);
      expect(Vector2.angleBetween(new Vector2(1, 0), new Vector2(0, -1))).to.equal(-Math.PI / 2);
    });

  });

  describe('add', () => {

    it('should return the sum of two vectors', () => {
      expect(new Vector2(1, 2).add(new Vector2(1, 1))).to.roughly.deep.equal(new Vector2(2, 3));
    });

  });

  describe('subtract', () => {

    it('should return the difference of two vectors', () => {
      expect(new Vector2(1, 2).subtract(new Vector2(1, 1))).to.roughly.deep.equal(new Vector2(0, 1));
    });

  });

  describe('multiplyByScalar', () => {

    it('should return scalar multiple of a vector', () => {
      expect(new Vector2(1, 2).multiplyByScalar(-2)).to.roughly.deep.equal(new Vector2(-2, -4));
    });

  });

  describe('negate', () => {

    it('should return the opposite vector', () => {
      expect(new Vector2(1, 2).negate()).to.roughly.deep.equal(new Vector2(-1, -2));
    });

  });

  describe('magnitude', () => {

    it('should return the length of a vector', () => {
      expect(new Vector2(3, 0).magnitude()).to.equal(3);
    });

  });

  describe('normalize', () => {

    it('should return a unit length vector in the same direction.', () => {
      expect(new Vector2(-5, 0).normalize()).to.roughly.deep.equal(new Vector2(-1, 0));
    });

  });

  describe('perpendicular', () => {

    it('should return a clockwise perpendicular vector by default', () => {
      expect(new Vector2(1, 0).perpendicular()).to.roughly.deep.equal(new Vector2(0, -1));
    });

    it('should return a counter-clockwise perpendicular vector when clockwise=false', () => {
      expect(new Vector2(1, 0).perpendicular(false)).to.roughly.deep.equal(new Vector2(0, 1));
    });

  });

  describe('toArray', () => {

    it('should return the vector as an array', () => {
      expect(new Vector2(5, 7).toArray()).to.roughly.deep.equal([5, 7]);
    });

  });

});
