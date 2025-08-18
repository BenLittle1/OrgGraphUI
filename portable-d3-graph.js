/**
 * Portable D3.js Force-Directed Graph Implementation
 * 
 * Self-contained implementation that can be copied to any codebase.
 * Only requires D3.js v7+ as a dependency.
 * 
 * Usage:
 * const graph = new PortableD3Graph(container, data, options);
 * graph.render();
 */

class PortableD3Graph {
  constructor(container, data, options = {}) {
    this.container = container;
    this.data = data;
    this.options = {
      width: 800,
      height: 600,
      ...options
    };
    
    this.svg = null;
    this.simulation = null;
    this.nodes = [];
    this.links = [];
    
    // Bind methods to preserve context
    this.handleZoom = this.handleZoom.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleNodeHover = this.handleNodeHover.bind(this);
    this.handleNodeClick = this.handleNodeClick.bind(this);
  }

  /**
   * Main render method - call this to create the visualization
   */
  render() {
    this.setupSVG();
    this.processData();
    this.createSimulation();
    this.renderNodes();
    this.renderLinks();
    this.setupInteractions();
    this.startSimulation();
  }

  /**
   * Clean up the visualization
   */
  destroy() {
    if (this.simulation) {
      this.simulation.stop();
    }
    if (this.svg) {
      this.svg.remove();
    }
  }

  /**
   * Setup SVG container
   */
  setupSVG() {
    // Clear existing
    d3.select(this.container).select('svg').remove();
    
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .style('background', 'radial-gradient(circle, #f8fafc 0%, #f1f5f9 100%)')
      .style('border', '1px solid #e5e7eb')
      .style('border-radius', '8px');

    // Main group for zoom/pan
    this.g = this.svg.append('g');
    
    // Setup zoom behavior
    this.zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', this.handleZoom);
    
    this.svg.call(this.zoom);
    
    // Set initial zoom for overview
    const initialScale = 0.25;
    const initialTransform = d3.zoomIdentity
      .translate(this.options.width / 2, this.options.height / 2)
      .scale(initialScale)
      .translate(-this.options.width / 2, -this.options.height / 2);
      
    this.svg.call(this.zoom.transform, initialTransform);
  }

  /**
   * Process and validate input data
   */
  processData() {
    if (!this.data || !this.data.nodes || !this.data.links) {
      throw new Error('Invalid data format. Expected { nodes: [], links: [] }');
    }
    
    // Clone data to avoid mutations
    this.nodes = JSON.parse(JSON.stringify(this.data.nodes));
    this.links = JSON.parse(JSON.stringify(this.data.links));
    
    // Validate required node properties
    this.nodes.forEach(node => {
      if (!node.id || node.level === undefined || node.completion === undefined || !node.weight) {
        throw new Error(`Invalid node: ${JSON.stringify(node)}. Required: id, level, completion, weight`);
      }
    });
  }

  /**
   * Create D3 force simulation with exact physics from guide
   */
  createSimulation() {
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links)
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
      .force('center', d3.forceCenter(this.options.width / 2, this.options.height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => this.getCollisionRadius(d))
        .strength(0.8)
      )
      .alphaDecay(0.02)      // Faster settling
      .velocityDecay(0.4);   // Stability
  }

  /**
   * Render graph links
   */
  renderLinks() {
    this.linkGroup = this.g.append('g').attr('class', 'links');
    
    this.linkSelection = this.linkGroup
      .selectAll('line')
      .data(this.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => this.getLinkStrokeWidth(d));
  }

  /**
   * Render graph nodes
   */
  renderNodes() {
    this.nodeGroup = this.g.append('g').attr('class', 'nodes');
    
    this.nodeSelection = this.nodeGroup
      .selectAll('g')
      .data(this.nodes)
      .join('g')
      .attr('class', 'node');

    // Add circles
    this.nodeSelection.append('circle')
      .attr('r', d => this.getNodeRadius(d))
      .attr('fill', d => this.getCompletionColor(d.completion))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.9);

    // Add labels
    this.renderNodeLabels();
  }

  /**
   * Render node labels with word wrapping
   */
  renderNodeLabels() {
    this.nodeSelection.each((d, i, nodes) => {
      const nodeGroup = d3.select(nodes[i]);
      const radius = this.getNodeRadius(d);
      const fontSize = Math.max(11, 16 - d.level * 2) * Math.min(1.5, Math.sqrt(d.weight) / 3);
      
      // Word wrapping algorithm
      const words = d.name.split(/\s+/);
      const maxCharsPerLine = Math.max(8, Math.floor(radius / 3));
      const lines = [];
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

  /**
   * Setup interactive behaviors
   */
  setupInteractions() {
    // Node dragging
    const drag = d3.drag()
      .on('start', this.handleDragStart)
      .on('drag', this.handleDrag)
      .on('end', this.handleDragEnd);

    this.nodeSelection.call(drag);

    // Node hover and click
    this.nodeSelection
      .on('mouseover', this.handleNodeHover)
      .on('mouseout', this.handleNodeHover)
      .on('click', this.handleNodeClick);

    // Background click to clear selection
    this.svg.on('click', (event) => {
      if (event.target === event.currentTarget) {
        this.clearSelection();
      }
    });
  }

  /**
   * Start the simulation with tick handler
   */
  startSimulation() {
    this.simulation.on('tick', () => {
      // Update link positions
      this.linkSelection
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      // Update node positions
      this.nodeSelection
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }

  // Event Handlers
  handleZoom(event) {
    this.g.attr('transform', event.transform);
  }

  handleDragStart(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  handleDrag(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  handleDragEnd(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  handleNodeHover(event, d) {
    const isMouseOver = event.type === 'mouseover';
    const circle = d3.select(event.currentTarget).select('circle');
    
    if (isMouseOver) {
      // Enlarge node
      circle.transition()
        .duration(200)
        .attr('r', Math.max(15, Math.sqrt(d.weight) * 6 + 3))
        .attr('opacity', 1);
      
      // Show tooltip if callback provided
      if (this.options.onNodeHover) {
        this.options.onNodeHover(d, event);
      }
    } else {
      // Restore size
      circle.transition()
        .duration(200)
        .attr('r', this.getNodeRadius(d))
        .attr('opacity', 0.9);
      
      // Hide tooltip if callback provided
      if (this.options.onNodeHover) {
        this.options.onNodeHover(null, event);
      }
    }
  }

  handleNodeClick(event, d) {
    event.stopPropagation();
    
    // Visual selection feedback
    this.clearSelection();
    d3.select(event.currentTarget).select('circle')
      .attr('stroke', '#007acc')
      .attr('stroke-width', 3);
    
    // Trigger callback if provided
    if (this.options.onNodeClick) {
      this.options.onNodeClick(d, event);
    }
  }

  clearSelection() {
    this.nodeSelection.selectAll('circle')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);
  }

  // Utility Methods (exact implementations from guide)
  getCompletionColor(percentage) {
    if (percentage === 0) return '#ef4444'; // Red for 0%
    if (percentage === 1) return '#10b981'; // Green for 100%
    
    // HSL gradient from red (0°) to green (120°) through yellow
    const hue = percentage * 120;
    return `hsl(${hue}, 70%, 50%)`;
  }

  getNodeRadius(d) {
    return Math.max(12, Math.sqrt(d.weight) * 6);
  }

  getCollisionRadius(d) {
    return Math.max(15, Math.sqrt(d.weight) * 6 + 4);
  }

  getLinkStrokeWidth(d) {
    return Math.max(1, 3 - Math.max(d.source.level, d.target.level));
  }

  // Public API methods
  updateData(newData) {
    this.data = newData;
    this.destroy();
    this.render();
  }

  resize(width, height) {
    this.options.width = width;
    this.options.height = height;
    
    this.svg
      .attr('width', width)
      .attr('height', height);
    
    this.simulation
      .force('center', d3.forceCenter(width / 2, height / 2))
      .restart();
  }
}

/**
 * Data transformation utilities for converting hierarchical data to graph format
 */
class GraphDataTransformer {
  /**
   * Convert hierarchical tree data to flat graph format
   * @param {Object} rootNode - Root of hierarchical tree
   * @param {Function} getChildren - Function to get children array from node
   * @param {Function} getNodeProps - Function to extract {id, name, completion, weight} from node
   * @returns {Object} {nodes: [], links: []}
   */
  static convertHierarchicalData(rootNode, getChildren, getNodeProps) {
    const nodes = [];
    const links = [];
    
    function traverse(node, level = 0, parentId = null) {
      const props = getNodeProps(node);
      const graphNode = {
        id: props.id,
        name: props.name,
        level: level,
        completion: props.completion || 0,
        weight: props.weight || 10,
        isLeaf: getChildren(node).length === 0,
        originalNode: node
      };
      
      nodes.push(graphNode);
      
      // Create parent-child link
      if (parentId) {
        links.push({
          source: parentId,
          target: props.id,
          strength: 1 / (level + 1)
        });
      }
      
      // Traverse children
      getChildren(node).forEach(child => {
        traverse(child, level + 1, props.id);
      });
    }
    
    traverse(rootNode);
    return { nodes, links };
  }

  /**
   * Create sample data for testing
   */
  static createSampleData() {
    const nodes = [
      { id: 'company', name: 'My Company', level: 0, completion: 0.6, weight: 50 },
      { id: 'finance', name: 'Finance', level: 1, completion: 0.8, weight: 25 },
      { id: 'hr', name: 'Human Resources', level: 1, completion: 0.4, weight: 20 },
      { id: 'product', name: 'Product', level: 1, completion: 0.7, weight: 30 },
      { id: 'accounting', name: 'Accounting Setup', level: 2, completion: 0.9, weight: 15 },
      { id: 'payroll', name: 'Payroll System', level: 2, completion: 0.7, weight: 12 },
      { id: 'hiring', name: 'Hiring Process', level: 2, completion: 0.3, weight: 10 },
      { id: 'development', name: 'Development Team', level: 2, completion: 0.8, weight: 18 },
      { id: 'bookkeeping', name: 'Monthly Bookkeeping', level: 3, completion: 1.0, weight: 8 },
      { id: 'tax-prep', name: 'Tax Preparation', level: 3, completion: 0.5, weight: 7 }
    ];

    const links = [
      { source: 'company', target: 'finance' },
      { source: 'company', target: 'hr' },
      { source: 'company', target: 'product' },
      { source: 'finance', target: 'accounting' },
      { source: 'finance', target: 'payroll' },
      { source: 'hr', target: 'hiring' },
      { source: 'product', target: 'development' },
      { source: 'accounting', target: 'bookkeeping' },
      { source: 'accounting', target: 'tax-prep' }
    ];

    return { nodes, links };
  }
}

// Export for module systems or attach to window for script tags
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PortableD3Graph, GraphDataTransformer };
} else if (typeof window !== 'undefined') {
  window.PortableD3Graph = PortableD3Graph;
  window.GraphDataTransformer = GraphDataTransformer;
}