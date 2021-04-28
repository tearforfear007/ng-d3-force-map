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
      { id: "1", radiusSize: 46, name: "謝侑翰", group: 1 },
      { id: "2", radiusSize: 46, name: "王韻綺", group: 2 },
      { id: "3", radiusSize: 46, name: "梁玉玫", group: 3 },
      { id: "4", radiusSize: 46, name: "家誠哥", group: 2 },
      { id: "5", radiusSize: 46, name: "黃彥宇", group: 2 },
      { id: "6", radiusSize: 46, name: "陳勇翰", group: 2 },
      { id: "7", radiusSize: 46, name: "朱李育", group: 4 },
      { id: "8", radiusSize: 46, name: "陳靈均", group: 4 }
    ],
    links: [
      { source: "5", target: "1", label: "同事" },
      { source: "5", target: "3", label: "同事" },
      { source: "5", target: "2", label: "學姐" },
      { source: "5", target: "2", label: "同事" },
      { source: "5", target: "4", label: "學長" },
      { source: "4", target: "5", label: "同事" },
      { source: "5", target: "6", label: "學弟" },
      // { source: "5", target: "7", label: "長官" },
      // { source: "7", target: "8", label: "長官" }
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

  scale = d3.scaleOrdinal(d3.schemeCategory10);

  color = (d: Node) => {
    return this.scale(d.group.toString());
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
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(200))
      .force('collision', d3.forceCollide().radius((d: any) => d.radiusSize));

    const svg = d3.select("#wrapper").append("svg")
      .attr("width", width)
      .attr("height", height);

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("fill", "none")
      .attr("stroke-width", d => {
        return Math.sqrt(d.value)
      });

    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(this.drag(simulation));

    const circles = node.append("circle")
      .attr("class", "myCircle")
      .attr("r", d => d.radiusSize)
      .attr("fill", d => this.color(d))
    // .attr("stroke", "#fff")
    // .attr("stroke-width", 1.5)
    // .call(this.drag(simulation));

    var labels = node.append("text")
      .text(function (d) {
        return d.name;
      })
      .style("fill", "white")
      .style("font-size", "22px")
      .style("text-anchor", "middle")
      .style("alignment-baseline", "middle")
    // .attr('x', 0)
    // .attr('y', 0);


    simulation.force<ForceLink<any, any>>("link").links(links);

    simulation.on("tick", () => {
      link
        // .attr("x1", d => d.source.x)
        // .attr("y1", d => d.source.y)
        // .attr("x2", d => d.target.x)
        // .attr("y2", d => d.target.y)
        .attr("d", d => {
          const curve = 2;
          const homogeneous = 5;
          const dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy) * (d.linknum + homogeneous) / (curve * homogeneous);  //linknum is defined above
          return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        });


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
