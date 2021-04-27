import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { ForceLink } from 'd3';
import { DataObject, Node } from '../models/common.interface';

@Component({
  selector: 'app-force-chart',
  templateUrl: './force-chart.component.html',
  styleUrls: ['./force-chart.component.scss']
})
export class ForceChartComponent implements OnInit {

  data: DataObject = {
    nodes: [
      { id: "1", radiusSize: 32, name: "謝侑翰", group: 1 },
      { id: "2", radiusSize: 32, name: "幽靈學姐", group: 2 },
      { id: "3", radiusSize: 32, name: "梁玉玫", group: 3 },
      { id: "4", radiusSize: 32, name: "家誠哥", group: 2 },
      { id: "5", radiusSize: 32, name: "黃彥宇", group: 2 },
      { id: "6", radiusSize: 32, name: "陳勇翰", group: 2 }
    ],
    links: [
      { source: "5", target: "1", label: "同事" },
      { source: "5", target: "3", label: "同事" },
      { source: "5", target: "2", label: "學姐" },
      { source: "5", target: "4", label: "學長" },
      { source: "5", target: "6", label: "學弟" }
    ],
  }

  drag = simulation => {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  color = (d: Node) => {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    return scale(d.group.toString());
  }

  dimensions = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  constructor() { }

  ngOnInit(): void {

    const { width, height } = this.dimensions;

    const links = this.data.links.map(d => Object.create(d));
    const nodes = this.data.nodes.map(d => Object.create(d));

    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(200).strength(1))
      .force('collision', d3.forceCollide().radius((d: any) => d.radiusSize + 10));

    const svg = d3.select("#wrapper").append("svg")
      .attr("width", width)
      .attr("height", height);

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => {
        return Math.sqrt(d.value)
      });

    const node = svg.append("g")
      .attr("class", "nodes")
      // .attr("stroke", "#fff")
      // .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .enter().append("g");

    const circles = node.append("circle")
      .attr("class", "myCircle")
      .attr("r", d => d.radiusSize)
      .attr("fill", this.color)
      .call(this.drag(simulation));

    var labels = node.append("text")
      .text(function (d) {
        return d.name;
      })
      .attr('x', d => d.radiusSize + 3)
      .attr('y', 0);


    simulation.force<ForceLink<any, any>>("link").links(links);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      node
        // works on g
        .attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
      // only works on circle
      // .attr("cx", d => d.x)
      // .attr("cy", d => d.y);
    });


    console.log(node);

  }

}
