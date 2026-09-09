import { Node, Edge } from "reactflow";
import { HandleType, ConnectionValidation } from "./types";

export function validateConnection(
  sourceType: HandleType,
  targetType: HandleType
): ConnectionValidation {
  // Define valid connection rules
  const validConnections: Record<HandleType, HandleType[]> = {
    text: ["text", "number"], // Text can connect to text or number inputs
    image: ["image", "url"], // Image can connect to image or url inputs
    video: ["video", "url"], // Video can connect to video or url inputs
    number: ["number"], // Number can connect to number inputs
    url: ["url", "image", "video"], // URL can connect to url, image, or video inputs
  };

  const allowed = validConnections[sourceType]?.includes(targetType) ?? false;

  return {
    isValid: allowed,
    sourceType,
    targetType,
    message: allowed
      ? undefined
      : `Cannot connect ${sourceType} output to ${targetType} input`,
  };
}

export function checkForCycles(
  nodes: Node[],
  edges: Edge[],
  sourceId: string,
  targetId: string
): boolean {
  if (sourceId === targetId) return true;
  const nodeIds = new Set(nodes.map(node => node.id));
  if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) return false;
  // Adding source -> target creates a cycle iff target already reaches source.
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;
    const neighbors = adjacency.get(edge.source) ?? [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
  }
  const pending = [targetId];
  const visited = new Set<string>();
  while (pending.length) {
    const current = pending.pop()!;
    if (current === sourceId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    pending.push(...(adjacency.get(current) ?? []));
  }
  return false;
}

export function getNodeDependencies(
  nodeId: string,
  edges: Edge[]
): string[] {
  return edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => edge.source);
}

export function getTopologicalOrder(
  nodes: Node[],
  edges: Edge[]
): string[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>();

  // Initialize
  for (const nodeId of nodeIds) {
    inDegree.set(nodeId, 0);
    graph.set(nodeId, []);
  }

  // Build graph and calculate in-degrees
  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      const neighbors = graph.get(edge.source) || [];
      neighbors.push(edge.target);
      graph.set(edge.source, neighbors);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighborId of neighbors) {
      const newDegree = (inDegree.get(neighborId) || 0) - 1;
      inDegree.set(neighborId, newDegree);
      if (newDegree === 0) {
        queue.push(neighborId);
      }
    }
  }

  if (result.length !== nodeIds.size) {
    throw new Error("Workflow contains a cycle; remove the circular connection before executing");
  }
  return result;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
