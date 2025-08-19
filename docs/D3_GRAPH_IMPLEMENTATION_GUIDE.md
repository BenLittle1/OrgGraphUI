# D3.js Force-Directed Graph Implementation Guide

## Overview

This document provides a complete technical specification for implementing the OrgGraph D3.js force-directed graph visualization. It can be used to recreate the same physics, visual encoding, and interactive behaviors with different node data structures.

## Data Structure Requirements

### Input Data Format

Your hierarchical data must be transformable to this interface:

```typescript
interface GraphNode {
  id: string;              // Unique identifier
  name: string;            // Display name
  level: number;           // Hierarchy level (0 = root, 1 = category, etc.)
  completion: number;      // Progress value (0.0 to 1.0)
  weight: number;          // Node importance/size factor
  isLeaf: boolean;         // Whether this is a leaf node
  originalNode?: any;      // Reference to source data
}

interface GraphLink {
  source: string;          // Source node ID
  target: string;          // Target node ID
  strength?: number;       // Link strength (optional)
}

interface GraphData {
  nodes: GraphNode[];      // All graph nodes
  links: GraphLink[];      // All connections
}
```

### Data Transformation Algorithm

Convert hierarchical data to graph format using this traversal pattern:

```typescript
function convertToGraphData(root: HierarchicalNode): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  
  function traverse(node: HierarchicalNode, level: number, parentId?: string): void {
    // Calculate completion percentage and weight from your data
    const completion = calculateYourProgress(node);
    const weight = calculateYourWeight(node);
    
    // Create graph node
    const graphNode: GraphNode = {
      id: node.id,
      name: node.name,
      level,
      completion,
      weight,
      isLeaf: node.children.length === 0,
      originalNode: node,
    };
    
    nodes.push(graphNode);
    
    // Create parent-child link
    if (parentId) {
      links.push({
        source: parentId,
        target: node.id,
        strength: 1 / (level + 1), // Weaker links for deeper levels
      });
    }
    
    // Traverse children
    node.children.forEach(child => {
      traverse(child, level + 1, node.id);
    });
  }
  
  traverse(root, 0);
  return { nodes, links };
}
```

## D3.js Force Simulation Configuration

### Core Physics Parameters

```typescript
const simulation = d3.forceSimulation<GraphNode>(nodes)
  .force('link', d3.forceLink<GraphNode, GraphLink>(links)
    .id(d => d.id)
    .distance(d => {
      // Dynamic distance based on hierarchy level
      return 80 + (d.source.level + d.target.level) * 20;
    })
    .strength(0.8)
  )
  .force('charge', d3.forceManyBody()
    .strength(d => {
      // Stronger repulsion for important nodes
      const baseStrength = -400;
      const levelMultiplier = Math.max(1, 3 - d.level);
      const weightMultiplier = Math.sqrt(d.weight);
      return baseStrength * levelMultiplier * weightMultiplier;
    })
  )
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide()
    .radius(d => {
      // Collision radius based on visual node size
      return Math.max(15, Math.sqrt(d.weight) * 6 + 4);
    })
    .strength(0.8)
  )
  .alphaDecay(0.02)      // Faster settling
  .velocityDecay(0.4);   // Stability
```

### Force Explanation

1. **Link Force**: Maintains parent-child relationships
   - Distance scales with hierarchy depth
   - Higher strength (0.8) for rigid structure

2. **Many-Body Force**: Creates node repulsion
   - Stronger for higher-level nodes (categories vs tasks)
   - Scales with node importance (weight)

3. **Center Force**: Keeps graph centered in viewport

4. **Collision Force**: Prevents node overlap
   - Radius matches visual node size
   - Moderate strength for natural clustering

5. **Alpha/Velocity Decay**: Controls simulation settling speed

## Visual Encoding System

### Node Sizing

```typescript
// Node radius calculation
const nodeRadius = (d: GraphNode) => Math.max(12, Math.sqrt(d.weight) * 6);

// Collision radius (slightly larger)
const collisionRadius = (d: GraphNode) => Math.max(15, Math.sqrt(d.weight) * 6 + 4);
```

### Color Encoding

```typescript
function getCompletionColor(percentage: number): string {
  if (percentage === 0) return '#ef4444'; // Red for 0%
  if (percentage === 1) return '#10b981'; // Green for 100%
  
  // HSL gradient from red (0°) to green (120°) through yellow
  const hue = percentage * 120;
  return `hsl(${hue}, 70%, 50%)`;
}
```

### Link Styling

```typescript
// Link stroke width based on hierarchy depth
const linkStrokeWidth = (d: GraphLink) => {
  return Math.max(1, 3 - Math.max(d.source.level, d.target.level));
};

// Standard link styling
.attr('stroke', '#999')
.attr('stroke-opacity', 0.6)
```

## Interactive Behaviors

### Zoom and Pan

```typescript
const zoom = d3.zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.1, 4])  // 10% to 400% zoom
  .on('zoom', (event) => {
    graphGroup.attr('transform', event.transform);
  });

svg.call(zoom);

// Set initial zoom for overview
const initialScale = 0.25;
const initialTransform = d3.zoomIdentity
  .translate(width / 2, height / 2)
  .scale(initialScale)
  .translate(-width / 2, -height / 2);
  
svg.call(zoom.transform, initialTransform);
```

### Node Dragging

```typescript
const drag = d3.drag<any, GraphNode>()
  .on('start', (event, d) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;  // Fix position
    d.fy = d.y;
  })
  .on('drag', (event, d) => {
    d.fx = event.x;
    d.fy = event.y;
  })
  .on('end', (event, d) => {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;  // Release fixed position
    d.fy = null;
  });

nodeSelection.call(drag);
```

### Hover Effects

```typescript
node.on('mouseover', function(event, d) {
  // Enlarge node
  d3.select(this).select('circle')
    .transition()
    .duration(200)
    .attr('r', Math.max(15, Math.sqrt(d.weight) * 6 + 3))
    .attr('opacity', 1);

  // Show tooltip
  showTooltip(event, d);
})
.on('mouseout', function(event, d) {
  // Restore size
  d3.select(this).select('circle')
    .transition()
    .duration(200)
    .attr('r', Math.max(12, Math.sqrt(d.weight) * 6))
    .attr('opacity', 0.9);

  // Hide tooltip
  hideTooltip();
});
```

### Click Selection

```typescript
node.on('click', (event, d) => {
  event.stopPropagation();
  setSelectedNode(d.id === selectedNode ? null : d.id);
  
  // Update visual selection
  updateNodeSelection(d.id);
  
  // Trigger callback
  if (onNodeClick) {
    onNodeClick(d);
  }
});

// Clear selection on background click
svg.on('click', () => {
  setSelectedNode(null);
});
```

## Node Label Rendering

### Text Wrapping Algorithm

```typescript
function renderNodeLabels(nodeSelection: d3.Selection<any, GraphNode, any, any>) {
  nodeSelection.each(function(d) {
    const nodeGroup = d3.select(this);
    const radius = Math.max(12, Math.sqrt(d.weight) * 6);
    const fontSize = Math.max(11, 16 - d.level * 2) * Math.min(1.5, Math.sqrt(d.weight) / 3);
    
    // Word wrapping
    const words = d.name.split(/\s+/);
    const maxCharsPerLine = Math.max(8, Math.floor(radius / 3));
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    // Limit to 3 lines
    const displayLines = lines.slice(0, 3);
    if (lines.length > 3) {
      displayLines[2] = displayLines[2].substring(0, maxCharsPerLine - 3) + '...';
    }
    
    // Render text lines
    displayLines.forEach((line, i) => {
      nodeGroup.append('text')
        .text(line)
        .attr('font-size', `${fontSize}px`)
        .attr('font-weight', d.level <= 1 ? 'bold' : 'normal')
        .attr('text-anchor', 'middle')
        .attr('dy', radius + 18 + (i * fontSize * 1.1))
        .attr('fill', '#000000')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', '1')
        .attr('pointer-events', 'none')
        .style('paint-order', 'stroke fill');
    });
  });
}
```

## Simulation Update Loop

```typescript
simulation.on('tick', () => {
  // Update link positions
  linkSelection
    .attr('x1', d => d.source.x!)
    .attr('y1', d => d.source.y!)
    .attr('x2', d => d.target.x!)
    .attr('y2', d => d.target.y!);

  // Update node positions
  nodeSelection
    .attr('transform', d => `translate(${d.x},${d.y})`);
});
```

## Container and Responsive Behavior

### SVG Setup

```typescript
const svg = d3.select(svgRef.current)
  .attr('width', width)
  .attr('height', height)
  .style('background', 'radial-gradient(circle, #f8fafc 0%, #f1f5f9 100%)');

const g = svg.append('g'); // Main group for zoom/pan
```

### Responsive Dimensions

```typescript
useEffect(() => {
  const updateDimensions = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width || 800,   // Fallback dimensions
        height: rect.height || 600,
      });
    }
  };

  updateDimensions();
  window.addEventListener('resize', updateDimensions);
  return () => window.removeEventListener('resize', updateDimensions);
}, []);
```

## Performance Optimizations

1. **Initial Zoom**: Start zoomed out (0.25x) for overview
2. **Alpha Decay**: Faster settling with 0.02 decay rate
3. **Collision Detection**: Efficient radius-based collision
4. **Text Optimization**: Smart word wrapping and line limits
5. **Event Delegation**: Efficient hover and click handling

## Integration with React

### Component Structure

```typescript
export default function GraphVisualization({ 
  width = 800, 
  height = 600, 
  data,
  onNodeClick 
}: {
  width?: number;
  height?: number;
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  
  // Implementation here...
}
```

### Cleanup

```typescript
useEffect(() => {
  createVisualization();
  
  return () => {
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
    d3.select('#tooltip').remove();
  };
}, [data]);
```

## Customization Points

To adapt this implementation for different data:

1. **Modify `convertToGraphData()`** to transform your hierarchical data
2. **Update weight calculation** based on your node importance metric  
3. **Customize color encoding** by modifying `getCompletionColor()`
4. **Adjust force parameters** for different node densities
5. **Customize labels** in the text rendering function
6. **Add domain-specific tooltips** and interactions

## Dependencies

```json
{
  "d3": "^7.9.0",
  "@types/d3": "^7.4.3",
  "react": "^18.2.0",
  "typescript": "^5.0.0"
}
```

This guide provides a complete technical specification for recreating the OrgGraph force-directed visualization with any hierarchical dataset. The physics simulation, visual encoding, and interactive behaviors can be implemented exactly as specified or customized for specific use cases.