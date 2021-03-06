'use strict';

import compiler from './index.js';
import parser from 'pivotql-parser-expression';

describe('Basic types', () => {
  test('NUMBER', () => {
    expect(compiler({ type: 'NUMBER', value: 10 })).toEqual(10);
  });
});

describe('Basic queries', () => {
  test('foo == "bar"', () => {
    expect(compiler(parser('foo == "bar"'))).toEqual({ foo: 'bar' });
  });
  test('foo == "bar" (nedb flavor)', () => {
    expect(compiler(parser('foo == "bar"'), { flavor: 'nedb' })).toEqual({
      foo: 'bar',
    });
  });
  test('foo != "bar"', () => {
    expect(compiler(parser('foo != "bar"'))).toEqual({ foo: { $ne: 'bar' } });
  });
  test('not (foo != "bar")', () => {
    expect(compiler(parser('not (foo != "bar")'))).toEqual({
      $nor: [{ foo: { $ne: 'bar' } }],
    });
  });
  test('foo > 10', () => {
    expect(compiler(parser('foo > 10'))).toEqual({ foo: { $gt: 10 } });
  });
  test('foo <= 42', () => {
    expect(compiler(parser('foo <= 42'))).toEqual({ foo: { $lte: 42 } });
  });
  test('foo <= 42 and foo >= 12', () => {
    expect(compiler(parser('foo <= 42 and foo >= 12'))).toEqual({
      $and: [{ foo: { $lte: 42 } }, { foo: { $gte: 12 } }],
    });
  });
  test('foo', () => {
    expect(compiler(parser('foo'))).toEqual({ foo: { $exists: true } });
  });
});

describe('Compound queries', () => {
  test('foo == "bar" and foo != "baz"', () => {
    expect(compiler(parser('foo == "bar" and foo != "baz"'))).toEqual({
      $and: [{ foo: 'bar' }, { foo: { $ne: 'baz' } }],
    });
  });
  test('foo == "bar" or bar != 10', () => {
    expect(compiler(parser('foo == "bar" or bar != 10'))).toEqual({
      $or: [{ foo: 'bar' }, { bar: { $ne: 10 } }],
    });
  });
  test('foo == "bar" or foo != "baz" and bam == 10', () => {
    expect(
      compiler(parser('foo == "bar" or foo != "baz" and bam == 10'))
    ).toEqual({
      $or: [{ foo: 'bar' }, { $and: [{ foo: { $ne: 'baz' } }, { bam: 10 }] }],
    });
  });
  test('(foo == "bar" or foo != "baz") and bam == 10', () => {
    expect(
      compiler(parser('(foo == "bar" or foo != "baz") and bam == 10'))
    ).toEqual({
      $and: [{ $or: [{ foo: 'bar' }, { foo: { $ne: 'baz' } }] }, { bam: 10 }],
    });
  });
  test('foo in ["bar", "baz"]', () => {
    expect(compiler(parser('foo in ["bar", "baz"]'))).toEqual({
      foo: { $in: ['bar', 'baz'] },
    });
  });
  test('foo in [10, 20]', () => {
    expect(compiler(parser('foo in [10, 20]'))).toEqual({
      foo: { $in: [10, 20] },
    });
  });
  test('foo and (bar or baz)', () => {
    expect(compiler(parser('foo and (bar or baz)'))).toEqual({
      $and: [
        { foo: { $exists: true } },
        { $or: [{ bar: { $exists: true } }, { baz: { $exists: true } }] },
      ],
    });
  });
});
