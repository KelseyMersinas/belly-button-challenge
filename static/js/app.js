// Build the metadata panel
function buildMetadata(metadata) {

  // Use d3 to select the panel with id of `#sample-metadata`
  const element = d3.select('#sample-metadata');

  // Use `.html("") to clear any existing metadata
  element.html("");

  // create formating for panel
  Object.entries(metadata).forEach(([key, value]) => {
    element.append('p')
        .text(`${key.toUpperCase()}: ${value}`);
  });
  
};

// function to build both charts
function buildCharts({ otu_ids, sample_values, otu_labels }) {

  // Build a Bubble Chart
  const bubbleTrace = {
    x: otu_ids,
    y: sample_values,
    mode: 'markers',
    marker: {
      size: sample_values,
      color: otu_ids,
      colorscale: 'Viridis',
      opacity: 0.5,
    },
  }; 

  // add data trace
  const bubbleData = [bubbleTrace];

  // create layout
  let bubbleLayout = {
    title: 'Bacteria Cultures Per Sample',
    yaxis: {
      title: 'Number of Bacteria',
    },
    xaxis: {
      title: 'OTU ID',
    },
  };

  // Render the Bubble Chart
  Plotly.newPlot('bubble', bubbleData, bubbleLayout);

  // For the Bar Chart, map the labels and values into variables 
  const combinedData = otu_ids.map((otu_id, i) => {
    return {
      otu_id: otu_id,
      otu_label: otu_labels[i],
      sampleValue: sample_values[i],
    };
  });

  //sort the sample values
  const sortedData = combinedData.toSorted((a, b) => {
    const sampleValueA = a.sampleValue;
    const sampleValueB = b.sampleValue;

    if (a > b) {
      return -1;
    }
    if (a < b) {
      return 1;
    }
    return 0;
  });
  
  // identify the top 10 samples
  const topTen = sortedData.slice(0, 10).reverse();

  // function to get the ids for the top 10 samples
  const topTenIDs = topTen.map((data) => {
    const { otu_id } = data;
    return `OTU ${otu_id}`;
  });

  // function to return just the top 10 samples and their values
  const topTenSamples = topTen.map((sample) => {
    const { sampleValue } = sample;
    return sampleValue;
  });

  // set up hover text for bar chart with mapping 
  const hoverText = topTen.map((data) => {
    return `OTU ID: ${data.otu_id}<br>Label: ${data.otu_label}<br>Sample Value: ${data.sampleValue}`;
  });

  // build the bar chart
  const barTrace = {
    type: 'bar',
    x: topTenSamples,
    y: topTenIDs,
    orientation: 'h',
    text: hoverText, 
    hoverinfo: 'text',
  };

  // add data trace
  const barData = [barTrace];

  // create layout
  const barLayout = {
    title: 'Top 10 Bacteria Cultures Found',
    yaxis: {
      title: 'OTU ID',
    },
    xaxis: {
      title: 'Number of Bacteria',
    },
  };

  // Build a Bar Chart
  Plotly.newPlot('bar', barData, barLayout);
}

// Function to run on page load
function init() {
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {

    // Get the names field
    const { names, metadata, samples } = data;
    const options = names.map((name) => {
      return {
        value: name, 
        text: name
      }
    });

    // Use d3 to select the dropdown with id of `#selDataset`
    const dropDown = d3.select('#selDataset')

    // Use the list of sample names to populate the select options
    dropDown.selectAll('option')
      .data(options)
      .enter()
      .append('option')
      .attr('value', d => d.value)
      .text(d => d.text);

    // Get the first sample from the list
    const [firstSample] = samples;
    console.log(firstSample);
    const [firstMetadata] = metadata;
    console.log('meta', firstMetadata);

    // Build charts and metadata panel with the first sample
    buildCharts(firstSample);
    buildMetadata(firstMetadata);
  });
}

// Function for event listener
function optionChanged(sampleName) {
  // Build charts and metadata panel each time a new sample is selected
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {
    console.log(data)
    const { names, metadata, samples } = data;
    const index = names.indexOf(sampleName);
    const newSample = samples[index];
    const newMeta = metadata[index];
    buildCharts(newSample);
    buildMetadata(newMeta);
  });
}

// Initialize the dashboard
init();