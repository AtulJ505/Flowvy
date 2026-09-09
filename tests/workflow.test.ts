import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Node, Edge } from 'reactflow';
import { checkForCycles, getTopologicalOrder } from '../lib/utils';
import { collectNodeInputs } from '../lib/workflow-execution';
import { importWorkflowFromJSON, exportWorkflowToJSON } from '../lib/workflow-persistence';

const node = (id: string): Node => ({ id, type: 'text', position: { x: 0, y: 0 }, data: { nodeType: 'text', text: id } });
const edge = (source: string, target: string): Edge => ({ id: `${source}-${target}`, source, target });
const nodes = ['a', 'b', 'c', 'd'].map(node);

test('detects a proposed edge closing a long cycle', () => {
  assert.equal(checkForCycles(nodes, [edge('a','b'), edge('b','c'), edge('c','d')], 'd','a'), true);
});
test('allows acyclic branches and rejects self loops', () => {
  assert.equal(checkForCycles(nodes, [edge('a','b'), edge('b','c')], 'a','d'), false);
  assert.equal(checkForCycles(nodes, [], 'a','a'), true);
});
test('topological order respects dependencies in a diamond', () => {
  const edges = [edge('a','b'), edge('a','c'), edge('b','d'), edge('c','d')];
  const order = getTopologicalOrder(nodes, edges);
  for (const e of edges) assert.ok(order.indexOf(e.source) < order.indexOf(e.target));
  assert.equal(order.length, 4);
});
test('cyclic workflow fails explicitly instead of returning a partial execution order', () => {
  assert.throws(() => getTopologicalOrder(nodes, [edge('a','b'),edge('b','a')]), /cycle/);
});
test('workflow JSON round trips nodes, edges and viewport', () => {
  const data = importWorkflowFromJSON(exportWorkflowToJSON(nodes, [edge('a','b')], { x: 2, y: 3, zoom: 1.5 }));
  assert.deepEqual(data.nodes.map(n => n.id), ['a','b','c','d']);
  assert.deepEqual(data.viewport, { x: 2, y: 3, zoom: 1.5 });
  assert.equal(data.edges[0].source, 'a');
});
for (const [name, value] of [
  ['null document', null],
  ['null node', { nodes: [null], edges: [] }],
  ['duplicate node IDs', { nodes: [node('a'),node('a')], edges: [] }],
  ['unknown edge endpoint', { nodes, edges: [edge('a','missing')] }],
  ['duplicate edge IDs', { nodes, edges: [edge('a','b'),edge('a','b')] }],
  ['cycle', { nodes, edges: [edge('a','b'),edge('b','a')] }],
] as const) {
  test(`rejects ${name} in imported workflows`, () => {
    assert.throws(() => importWorkflowFromJSON(JSON.stringify(value)), /Failed to parse workflow JSON/);
  });
}
test('invalid viewport zoom falls back to the default', () => {
  const data = importWorkflowFromJSON(JSON.stringify({ nodes, edges: [], viewport: { x: 1, y: 2, zoom: 0 } }));
  assert.deepEqual(data.viewport, { x: 0, y: 0, zoom: 1 });
});
test('multiple inputs preserve an empty first value', () => {
  const sources = [node('a'),node('b'),node('c')];
  sources[0].data.text = '';
  assert.deepEqual(collectNodeInputs('c', sources, [edge('a','c'),edge('b','c')]).input, ['', 'b']);
});
