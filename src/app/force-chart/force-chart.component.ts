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

  radiusSize = 46;
  squareSize = {
    w: 100,
    h: 100
  }
  rectangleSize = {
    w: 180,
    h: 100
  }

  data: DataObject = {
    nodes: [
      { id: "1", name: "蔡奇珊", spouse: "李青海", area: "花蓮縣新城鄉", shape: "square", group: 1 },
      { id: "2", name: "李青海", spouse: "蔡奇珊", area: "花蓮縣新城鄉", shape: "oval", group: 2 },
      { id: "3", name: "朱李育", spouse: "", area: "花蓮縣花蓮市", shape: "rectangle", group: 3 },
      { id: "4", name: "林瀧誌", spouse: "", area: "花蓮縣新城鄉", shape: "rectangle", group: 3 },
      { id: "5", name: "林宗興", spouse: "", area: "花蓮縣新城鄉", shape: "rectangle", group: 4 }
    ],
    links: [
      { source: "1", target: "2", relation: "同修" },
      { source: "1", target: "3", relation: "推薦" },
      { source: "1", target: "4", relation: "推薦" },
      { source: "4", target: "5", relation: "推薦" },
    ]
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

  linkArc = (d) => {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `;
  }


  linkColorScale = d3.scaleOrdinal(d3.schemeCategory10);
  linkColor = (d) => this.linkColorScale(d.toString())

  // group:1,藍色
  // group:2,綠色
  // group:3,橘色
  // group:4,淡紅色
  scale = d3.scaleOrdinal(["blue", "green", "orange", "red"])
  color = (d) => this.scale(d.toString())

  dimensions = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  constructor() { }

  ngOnInit(): void {

    const { width, height } = this.dimensions;

    const links = this.data.links.map(d => Object.create(d));
    const nodes = this.data.nodes.map(d => Object.create(d));

    //any links with duplicate source and target get an incremented 'linknum'
    for (var i = 0; i < links.length; i++) {
      if (i != 0 &&
        links[i].source == links[i - 1].source &&
        links[i].target == links[i - 1].target) {
        links[i].linknum = links[i - 1].linknum + 1;
      }
      else { links[i].linknum = 1; };
    };
    console.log(links)

    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(400))
      .force('collision', d3.forceCollide().radius((d: any) => 100))
      // .force("x", d3.forceX())
      .force("y", d3.forceY());
    const svg = d3.select("#wrapper").append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("font", "20px sans-serif");

    const types = Array.from(new Set(links.map(d => d.relation)))
    console.log("types", types)
    // Per-type markers, as they don't inherit styles.
    svg.append("defs").selectAll("marker")
      .data(types)
      .join("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 39)
      .attr("refY", -4.2)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", d => this.linkColor(d))
      .attr("d", "M0,-5L10,0L0,5");



    // const link = svg.append("g")
    //   .attr("stroke", "#999")
    //   .attr("stroke-opacity", 0.6)
    //   .attr("class", "links")
    //   .selectAll("path")
    //   .data(links)
    //   .join("path")
    //   .attr("fill", "none")
    //   .attr("stroke-width", d => {
    //     return Math.sqrt(d.value)
    //   });

    const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", d => this.linkColor(d.relation))
      .attr("marker-end", d => `url(#arrow-${d.relation}`);

    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(this.drag(simulation));

    const circles = node
      .filter(d => d.shape == "oval")
      .append("circle")
      .attr("class", "myCircle")
      .attr("r", this.radiusSize)
      .attr("fill", d => this.color(d.group))
    // .attr("stroke", "#fff")
    // .attr("stroke-width", 1.5)
    // .call(this.drag(simulation));

    const rects = node
      .filter(d => d.shape == "rectangle")
      .append('rect')
      .attr('width', this.rectangleSize.w)
      .attr('height', this.rectangleSize.h)
      .attr('class', 'node')
      .attr('fill', d => this.color(d.group))
    // .attr('stroke', '#252525')
    // .attr('stroke-width', 2)

    const squares = node
      .filter(d => d.shape == "square")
      .append('rect')
      .attr('width', this.squareSize.w)
      .attr('height', this.squareSize.h)
      .attr('class', 'node')
      .attr('fill', d => this.color(d.group))

    const circleLabels = node
      .filter(d => d.shape == "oval")
      .append("text")
      .text(function (d) {
        return d.name;
      })
      // .attr("startOffset", "25%")
      .style("fill", "white")
      // .style("font-size", "22px")
      .style("text-anchor", "middle")
      .style("alignment-baseline", "middle")
    // .attr('x', 50)
    // .attr('y', 50);

    const rectLabels = node
      .filter(d => d.shape == "rectangle")
      .append("text")
      .text(function (d) {
        return d.name;
      })
      .style("fill", "white")
      .style("text-anchor", "middle")
      .style("alignment-baseline", "middle")
      .attr('x', this.rectangleSize.w / 2)
      .attr('y', this.rectangleSize.h / 2);

    const squareLabels = node
      .filter(d => d.shape == "square")
      .append("text")
      .text(function (d) {
        return d.name;
      })
      .style("fill", "white")
      .style("text-anchor", "middle")
      .style("alignment-baseline", "middle")
      .attr('x', this.squareSize.w / 2)
      .attr('y', this.squareSize.h / 2);


    simulation.force<ForceLink<any, any>>("link").links(links);

    simulation.on("tick", () => {
      link
        // .attr("x1", d => d.source.x)
        // .attr("y1", d => d.source.y)
        // .attr("x2", d => d.target.x)
        // .attr("y2", d => d.target.y)
        // .attr("d", d => {
        //   const curve = 2;
        //   const homogeneous = 5;
        //   const dx = d.target.x - d.source.x,
        //     dy = d.target.y - d.source.y,
        //     dr = Math.sqrt(dx * dx + dy * dy) * (d.linknum + homogeneous) / (curve * homogeneous);  //linknum is defined above
        //   return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        // });
      .attr("d", this.linkArc);


      node
        // works on g
        .attr("transform", d => `translate(${d.x},${d.y})`);
      // only works on circle
      // .attr("cx", d => d.x)
      // .attr("cy", d => d.y);
    });


    console.log(node);

  }

}
