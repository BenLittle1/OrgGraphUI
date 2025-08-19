"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { Maximize, Minimize } from 'lucide-react'
import * as d3 from 'd3'
import { GraphData, GraphNode, GraphLink, getCompletionColor, getNodeRadius, getCollisionRadius } from '@/lib/graph-data'

interface GraphVisualizationProps {
  width?: number
  height?: number
  data: GraphData
  onNodeClick?: (node: GraphNode) => void
}

export default function GraphVisualization({ 
  width = 800, 
  height = 600, 
  data,
  onNodeClick 
}: GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }, [isFullscreen])

  // Listen for fullscreen changes and recenter graph
  useEffect(() => {
    const handleFullscreenChange = () => {
      const wasFullscreen = isFullscreen
      const nowFullscreen = !!document.fullscreenElement
      setIsFullscreen(nowFullscreen)
      
      // If entering fullscreen, trigger recreation of visualization which will center properly
      if (!wasFullscreen && nowFullscreen) {
        setTimeout(() => {
          // The createVisualization function will be called due to dimensions change
          // and will properly center the root node
        }, 100)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [isFullscreen])

  // Process data to avoid mutations
  const processedData = useCallback(() => {
    if (!data || !data.nodes || !data.links) return { nodes: [], links: [] }
    
    // Clone data to avoid mutations
    const nodes = JSON.parse(JSON.stringify(data.nodes))
    const links = JSON.parse(JSON.stringify(data.links))
    
    return { nodes, links }
  }, [data])

  // Show tooltip
  const showTooltip = useCallback((event: MouseEvent, d: GraphNode) => {
    const tooltip = d3.select('body')
      .selectAll('.graph-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'graph-tooltip fixed z-50 rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md pointer-events-none opacity-0')
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px')
      
    tooltip.html(`
      <div><strong>${d.name}</strong></div>
      <div>Level: ${d.level}</div>
      <div>Completion: ${Math.round(d.completion * 100)}%</div>
      <div>Weight: ${d.weight.toFixed(1)}</div>
    `)
    .transition()
    .duration(200)
    .style('opacity', 1)
  }, [])

  const hideTooltip = useCallback(() => {
    d3.select('.graph-tooltip')
      .transition()
      .duration(200)
      .style('opacity', 0)
      .remove()
  }, [])

  // Render node labels with word wrapping - exact implementation from guide
  const renderNodeLabels = useCallback((nodeSelection: d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown>) => {
    nodeSelection.each(function(d) {
      const nodeGroup = d3.select(this)
      const radius = Math.max(12, Math.sqrt(d.weight) * 6)
      const fontSize = Math.max(11, 16 - d.level * 2) * Math.min(1.5, Math.sqrt(d.weight) / 3)
      
      // Word wrapping algorithm - exact from guide
      const words = d.name.split(/\s+/)
      const maxCharsPerLine = Math.max(8, Math.floor(radius / 3))
      const lines: string[] = []
      let currentLine = ''
      
      words.forEach(word => {
        if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
          currentLine = currentLine ? currentLine + ' ' + word : word
        } else {
          if (currentLine) lines.push(currentLine)
          currentLine = word
        }
      })
      if (currentLine) lines.push(currentLine)
      
      // Limit to 3 lines
      const displayLines = lines.slice(0, 3)
      if (lines.length > 3) {
        displayLines[2] = displayLines[2].substring(0, maxCharsPerLine - 3) + '...'
      }
      
      // Render text lines - exact from guide
      displayLines.forEach((line, i) => {
        nodeGroup.append('text')
          .text(line)
          .attr('font-size', `${fontSize}px`)
          .attr('font-weight', d.level <= 1 ? 'bold' : 'normal')
          .attr('text-anchor', 'middle')
          .attr('dy', radius + 18 + (i * fontSize * 1.1))
          .attr('fill', 'hsl(var(--foreground))')
          .attr('stroke', 'hsl(var(--background))')
          .attr('stroke-width', '1')
          .attr('pointer-events', 'none')
          .style('paint-order', 'stroke fill')
      })
    })
  }, [])

  // Create visualization using exact specification from guide
  const createVisualization = useCallback(() => {
    if (!svgRef.current) return
    
    const { nodes, links } = processedData()
    if (!nodes.length) return

    const { width: w, height: h } = dimensions
    
    // Clear existing
    d3.select(svgRef.current).select('svg').remove()
    
    // Setup SVG - exact from guide
    const svg = d3.select(svgRef.current)
      .attr('width', w)
      .attr('height', h)

    // Clear previous content
    svg.selectAll('*').remove()

    // Main group for zoom/pan
    const g = svg.append('g')
    
    // Setup zoom behavior - exact from guide
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    
    svg.call(zoom)
    
    // Set initial zoom for overview - adjust scale based on screen size
    const initialScale = isFullscreen ? 0.3 : 0.25
    const initialTransform = d3.zoomIdentity
      .translate(w / 2, h / 2)
      .scale(initialScale)
      .translate(-w / 2, -h / 2)
      
    svg.call(zoom.transform, initialTransform)

    // Create force simulation with EXACT physics from guide
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(d => {
          const source = d.source as GraphNode
          const target = d.target as GraphNode
          
          // Tight clustering distances
          if ((source.level === 1 && target.level === 2) || (source.level === 2 && target.level === 1)) {
            return 65 // Category to subcategory - tight clustering
          }
          if ((source.level === 2 && target.level === 3) || (source.level === 3 && target.level === 2)) {
            return 40 // Subcategory to task - tight clustering
          }
          
          // Original distance calculation for root-to-category links
          return 80 + (source.level + target.level) * 20
        })
        .strength(d => {
          // Weaker link strength for root-to-category connections to allow better spreading
          const source = d.source as GraphNode
          const target = d.target as GraphNode
          if ((source.level === 0 && target.level === 1) || (source.level === 1 && target.level === 0)) {
            return 0.2 // Much weaker links from center to categories
          }
          return 0.8 // Normal strength for other links
        })
      )
      .force('charge', d3.forceManyBody()
        .strength(d => {
          const node = d as GraphNode
          const baseStrength = -400
          
          // Extremely strong repulsion for category nodes (level 1) to spread them around the radial constraint
          if (node.level === 1) {
            // All category nodes get extremely strong repulsion to spread out around the circle
            const levelMultiplier = Math.max(1, 3 - node.level) // = 2 for level 1
            return baseStrength * levelMultiplier * 30 // Extremely strong repulsion for maximum separation
          }
          
          // Keep weight-based repulsion for other levels (subcategories and tasks)
          const levelMultiplier = Math.max(1, 3 - node.level)
          const weightMultiplier = Math.sqrt(node.weight)
          return baseStrength * levelMultiplier * weightMultiplier
        })
      )
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide()
        .radius(d => {
          // Collision radius based on visual node size - EXACT from guide
          const node = d as GraphNode
          return Math.max(15, Math.sqrt(node.weight) * 6 + 4)
        })
        .strength(0.8)
      )
      .force('radial', d3.forceRadial(d => {
          const node = d as GraphNode
          // Apply radial force only to category nodes (level 1) to maintain consistent distance from center
          if (node.level === 1) {
            return 400 // Increased radius to position categories further from center
          }
          return 0 // No radial constraint for other levels
        }, w / 2, h / 2)
        .strength(d => {
          const node = d as GraphNode
          return node.level === 1 ? 1.5 : 0 // Balanced radial force - strong enough for equal distance, weak enough for repulsion
        })
      )
      .alphaDecay(0.02)      // Faster settling - EXACT from guide
      .velocityDecay(0.4)    // Stability - EXACT from guide

    simulationRef.current = simulation

    // Render links - exact from guide
    const linkGroup = g.append('g').attr('class', 'links')
    
    const linkSelection = linkGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data<GraphLink>(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => {
        // Link stroke width based on hierarchy depth - exact from guide
        return Math.max(1, 3 - Math.max((d.source as GraphNode).level, (d.target as GraphNode).level))
      })

    // Render nodes - exact from guide
    const nodeGroup = g.append('g').attr('class', 'nodes')
    
    const nodeSelection = nodeGroup
      .selectAll<SVGGElement, GraphNode>('g')
      .data<GraphNode>(nodes)
      .join('g')
      .attr('class', 'node')

    // Add circles - exact from guide
    nodeSelection.append('circle')
      .attr('r', d => Math.max(12, Math.sqrt(d.weight) * 6))
      .attr('fill', d => getCompletionColor(d.completion))
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.9)

    // Add labels - exact from guide
    renderNodeLabels(nodeSelection)

    // Setup interactions - exact from guide
    const drag = d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    nodeSelection.call(drag)

    // Node hover and click - exact from guide
    nodeSelection
      .on('mouseover', function(event, d) {
        // Enlarge node
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', Math.max(15, Math.sqrt(d.weight) * 6 + 3))
          .attr('opacity', 1)

        // Show tooltip
        showTooltip(event, d)
      })
      .on('mouseout', function(event, d) {
        // Restore size
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', Math.max(12, Math.sqrt(d.weight) * 6))
          .attr('opacity', 0.9)

        // Hide tooltip
        hideTooltip()
      })
      .on('click', (event, d) => {
        event.stopPropagation()
        
        // Visual selection feedback
        nodeSelection.selectAll('circle')
          .attr('stroke', 'hsl(var(--background))')
          .attr('stroke-width', 1.5)
        
        d3.select(event.currentTarget).select('circle')
          .attr('stroke', 'hsl(var(--primary))')
          .attr('stroke-width', 3)
        
        setSelectedNode(d.id === selectedNode ? null : d.id)
        
        if (onNodeClick) {
          onNodeClick(d)
        }
      })

    // Background click to clear selection
    svg.on('click', (event) => {
      if (event.target === event.currentTarget) {
        setSelectedNode(null)
        nodeSelection.selectAll('circle')
          .attr('stroke', 'hsl(var(--background))')
          .attr('stroke-width', 1.5)
      }
    })

    // Start simulation with tick handler - exact from guide
    simulation.on('tick', () => {
      // Update link positions
      linkSelection
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!)

      // Update node positions
      nodeSelection
        .attr('transform', d => `translate(${d.x},${d.y})`)
    })

  }, [data, dimensions, selectedNode, onNodeClick, showTooltip, hideTooltip, renderNodeLabels, processedData])

  // Create visualization when data changes
  useEffect(() => {
    createVisualization()
    
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
      d3.select('.graph-tooltip').remove()
    }
  }, [createVisualization])

  return (
    <div 
      ref={containerRef}
      className="w-full h-full min-h-[600px] relative overflow-hidden bg-white dark:bg-gray-900"
    >
      <svg 
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: 'grab' }}
      />
      
      {/* Controls overlay */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border">
        <div className="text-sm text-muted-foreground space-y-1">
          <div>• Drag nodes to reposition</div>
          <div>• Scroll to zoom in/out</div>
          <div>• Click nodes to select</div>
          <div>• Hover for details</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border">
        <div className="text-sm font-medium mb-2 text-foreground">Completion Status</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 dark:bg-red-400"></div>
            <span className="text-sm text-muted-foreground">Not Started (0%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 dark:bg-yellow-400"></div>
            <span className="text-sm text-muted-foreground">In Progress (50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 dark:bg-green-400"></div>
            <span className="text-sm text-muted-foreground">Completed (100%)</span>
          </div>
        </div>
      </div>

      {/* Fullscreen toggle button */}
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm border rounded-lg p-2 shadow-sm hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <Minimize className="h-5 w-5 text-foreground" />
        ) : (
          <Maximize className="h-5 w-5 text-foreground" />
        )}
      </button>
    </div>
  )
}