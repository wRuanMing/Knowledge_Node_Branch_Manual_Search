import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TurnData, KnowledgeGraphNode, KnowledgeGraphLink } from '../types';

interface KnowledgeGraphProps {
  history: TurnData[];
  rootTopic: string;
  width?: number;
  height?: number;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ history, rootTopic, width = 800, height = 600 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || history.length === 0) return;

    // 1. Prepare Data
    const nodes: KnowledgeGraphNode[] = [];
    const links: KnowledgeGraphLink[] = [];

    // Root Node
    const rootId = 'root';
    nodes.push({ id: rootId, label: rootTopic, type: 'root', round: 0 });

    let previousId = rootId;

    history.forEach((turn, index) => {
      const roundNum = index + 1;
      
      // Add all options as nodes
      turn.options.forEach((opt) => {
        const isSelected = opt.id === turn.selectedCard?.id;
        nodes.push({
          id: opt.id,
          label: opt.title,
          type: isSelected ? 'selected' : 'discarded',
          round: roundNum,
          description: opt.description
        });

        // Link from previous selection to these options
        links.push({
          source: previousId,
          target: opt.id,
          value: isSelected ? 2 : 1
        });
      });

      // Update previousId for next iteration
      if (turn.selectedCard) {
        previousId = turn.selectedCard.id;
      }
    });

    // 2. D3 Setup
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const containerGroup = svg.append("g");
    
    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        containerGroup.attr("transform", event.transform);
      });
    
    svg.call(zoom);

    // Simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("collide", d3.forceCollide().radius(40))
      // Force nodes to align somewhat by round (y-axis)
      .force("y", d3.forceY((d: any) => d.round * 80).strength(0.5)) 
      .force("x", d3.forceX(width / 2).strength(0.05));

    // Links
    const link = containerGroup.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => d.value === 2 ? 3 : 1)
      .attr("stroke", (d) => d.value === 2 ? "#4f46e5" : "#cbd5e1"); // Indigo for path, slate for others

    // Nodes
    const node = containerGroup.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node Circles
    node.append("circle")
      .attr("r", (d) => d.type === 'root' ? 20 : d.type === 'selected' ? 15 : 8)
      .attr("fill", (d) => {
        if (d.type === 'root') return "#ef4444"; // Red
        if (d.type === 'selected') return "#4f46e5"; // Indigo
        return "#94a3b8"; // Slate
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Labels
    node.append("text")
      .text((d) => d.label)
      .attr("x", 22)
      .attr("y", 5)
      .style("font-size", "12px")
      .style("font-family", "Inter, sans-serif")
      .style("fill", "#1e293b")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff");

    // Tooltips (simple title)
    node.append("title")
      .text(d => `${d.label}\n${d.description || ''}`);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Initial zoom to fit (centered somewhat)
    const initialTransform = d3.zoomIdentity.translate(width / 2, 50).scale(0.8);
    svg.call(zoom.transform, initialTransform);

  }, [history, rootTopic, width, height]);

  return (
    <div className="rounded-xl overflow-hidden shadow-inner border border-slate-200 bg-white">
      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default KnowledgeGraph;
