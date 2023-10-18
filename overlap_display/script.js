function getMetricLabel(metric) {
  let partialOverlapLabel;
  switch (metric.metric_protocol_spec.partial_overlap_spec) {
    case 0:
      partialOverlapLabel = "Binary";
      break;
    case 1:
      partialOverlapLabel = "Jaccard";
      break;
    case 2:
      partialOverlapLabel = "Token";
      break;
    default:
      partialOverlapLabel = "Unknown";
  }
  const frequencyLabel = metric.metric_protocol_spec.frequency_spec.filter_value > 0 ? "filtered" : "unfiltered";
  const weightingLabel = metric.metric_protocol_spec.frequency_spec.weighting ? "weighted" : "unweighted";

  return `${partialOverlapLabel} ${frequencyLabel} ${weightingLabel}`;
}

document.addEventListener("DOMContentLoaded", function () {
  function loadJSONL(filename) {

    const directoryPath = "ngram_data/";
    const fullPath = directoryPath + filename;
    fetch(fullPath)
      .then((response) => response.text())
      .then((jsonlText) => {
        const jsonObjects = jsonlText.trim().split('\n');
        const paragraphsContainer = document.getElementById("paragraphs-container");

        jsonObjects.forEach((jsonObject) => {
          const jsonData = JSON.parse(jsonObject);
    
          ['annotated_input_overlap', 'annotated_ref_overlap'].forEach(overlapType => {
            const paragraphData = jsonData[overlapType].annotated_entry_overlap;
            const metricsData = jsonData[overlapType].metrics;
    
            const annotationsContainer = document.createElement("div");
            annotationsContainer.classList.add("annotations");
    
            const scenarioSpec = jsonData.stats_key.light_scenario_key.scenario_spec;
            const split = jsonData.stats_key.light_scenario_key.split;
            const part = jsonData[overlapType].part;
            const instanceId = jsonData.instance_id;
    
            const annotationsData = document.createElement("pre");
    

    
            annotationsData.textContent += `Scenario Spec: ${JSON.stringify(scenarioSpec, null, 2)}\nSplit: ${split}\nPart: ${part}\nInstance ID: ${instanceId}\nOverlap Type: ${overlapType}\n`;
    
            metricsData.forEach(metric => {
              const metricLabel = getMetricLabel(metric);
              annotationsData.textContent += `${metricLabel}: ${metric.metric_score}\n`;
            });

            // Add a show more button
            const showMoreButton = document.createElement("div");
            showMoreButton.classList.add("show-more-button");
            showMoreButton.textContent = "Show Metadata";
            showMoreButton.addEventListener("click", function() {
              if (annotationsData.classList.contains("annotations-content-hidden")) {
                annotationsData.classList.remove("annotations-content-hidden");
                showMoreButton.textContent = "Show Less";
              } else {
                annotationsData.classList.add("annotations-content-hidden");
                showMoreButton.textContent = "Show More";
              }
            });

            // Append the button and annotationsData to annotationsContainer
            annotationsContainer.appendChild(showMoreButton);
            annotationsData.classList.add("annotations-content-hidden");  // Initially hide the annotations data
            annotationsContainer.appendChild(annotationsData);
                   
            // Adding LightInstance information
            const inputRefContainer = document.createElement("div");
            inputRefContainer.classList.add("input-reference-container");

            if (overlapType === 'annotated_input_overlap') {
              inputRefContainer.textContent = `Input: ${jsonData.instance.input}`;
              annotationsContainer.appendChild(inputRefContainer);
            } else if (overlapType === 'annotated_ref_overlap' && jsonData.instance.references.length > 0) {
              inputRefContainer.textContent = `Reference: ${jsonData.instance.references.join("\n ")}`;
              annotationsContainer.appendChild(inputRefContainer);
            } 
  
            // Create a container for the main paragraph content
            const paragraphContainer = document.createElement("div");
            paragraphContainer.classList.add("paragraph-container");

            // Create the paragraph content
            const paragraphElement = document.createElement("p");
            let paragraphHTML = "";

            let bold_counter = 0;

            paragraphData.forEach(([word, count], i) => {
              let wordContent = `<span class="word-content">${word}</span>`;
              let countContent = `<span class="count-content">${count > 0 ? count : ''}</span>`;
            
              let wordElement = `<span class="word-container" data-count="${count}">${countContent}${wordContent}</span>`;
            
              if (count > 0) {
                wordElement = `<span class="word-container bold" data-count="${count}">${countContent}${wordContent}</span>`;
                bold_counter = 12;
              }
              else {
                if (bold_counter > 0) {
                  bold_counter -= 1;
                  wordElement = `<span class="word-container bold">${countContent}${wordContent}</span>`;
                }
              }
            
              paragraphHTML += `${wordElement} `;
            });
            

            paragraphElement.innerHTML = paragraphHTML;
            paragraphContainer.appendChild(paragraphElement);

            // Append both containers to the paragraphs container
            paragraphsContainer.appendChild(annotationsContainer);
            paragraphsContainer.appendChild(paragraphContainer);
          });
        });

        // Add event listeners to show counts on hover for each word
        const wordSpans = document.querySelectorAll(".paragraph-container span");
        wordSpans.forEach((span) => {
          span.addEventListener("mouseover", function () {
            const count = this.getAttribute("data-count");
            if (count > 0) {
              this.setAttribute("title", `Count: ${count}`);
            } else {
              this.removeAttribute("title");
            }
          });
        });
      })
      .catch((error) => {
        console.error("Error loading data:", error);
      });
    }

  // Load JSONL data when the user clicks the load button
  // const loadButton = document.getElementById("load-button");
  // loadButton.addEventListener("click", function () {
    // const filenameInput = document.getElementById("jsonl-file");
    // const filename = filenameInput.value + '.jsonl';
  const filenameInput = document.getElementById("jsonl-file");
  filenameInput.addEventListener("change", function() {

    const filename = document.getElementById("jsonl-file").value;

    // Clear existing content from paragraphs container
    const paragraphsContainer = document.getElementById("paragraphs-container");
    paragraphsContainer.innerHTML = "";

    // Load JSONL data with the given filename
    loadJSONL(filename);
  });
  // Event listener for click event to clear the text box
  filenameInput.addEventListener("click", function() {
    // Clear the text box
    filenameInput.value = "";
    filenameInput.focus();
  });
});
