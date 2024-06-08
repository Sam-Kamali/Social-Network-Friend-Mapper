document.addEventListener("DOMContentLoaded", () => {
  // D3.js Visualization
  const width = document.getElementById("network").clientWidth;
  const height = document.getElementById("network").clientHeight;

  const svg = d3
    .select("#network")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id((d) => d.id)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  let nodes = [
    { id: 1, name: "User1" },
    { id: 2, name: "User2" },
  ];

  let links = [{ source: 1, target: 2 }];

  const updateGraph = () => {
    svg.selectAll("*").remove();

    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", 2);

    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    node.append("title").text((d) => d.name);

    simulation.nodes(nodes).on("tick", ticked);

    simulation.force("link").links(links);

    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    }
  };

  const dragstarted = (event, d) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  };

  const dragged = (event, d) => {
    d.fx = event.x;
    d.fy = event.y;
  };

  const dragended = (event, d) => {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  };

  updateGraph();

  document.getElementById("addFriend").addEventListener("click", () => {
    const newId = nodes.length + 1;
    nodes.push({ id: newId, name: `User${newId}` });
    if (nodes.length > 1) {
      links.push({ source: newId - 1, target: newId });
    }
    updateGraph();
  });

  document.getElementById("removeFriend").addEventListener("click", () => {
    nodes.pop();
    links.pop();
    updateGraph();
  });

  // i18n Setup
  i18next
    .use(i18nextXHRBackend)
    .use(i18nextBrowserLanguageDetector)
    .init(
      {
        fallbackLng: "en",
        backend: {
          loadPath: "locales/{{lng}}.json",
        },
      },
      (err, t) => {
        if (err) return console.error(err);
        updateContent();
      }
    );

  const updateContent = () => {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.innerHTML = i18next.t(element.getAttribute("data-i18n"));
    });
  };

  i18next.on("languageChanged", () => {
    updateContent();
  });
});
