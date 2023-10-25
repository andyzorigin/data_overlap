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

            annotationsContainer.appendChild(showMoreButton);
            annotationsData.classList.add("annotations-content-hidden");
            annotationsContainer.appendChild(annotationsData);
                   
            const inputRefContainer = document.createElement("div");
            inputRefContainer.classList.add("input-reference-container");

            if (overlapType === 'annotated_input_overlap') {
              inputRefContainer.textContent = `Input: ${jsonData.instance.input}`;
              annotationsContainer.appendChild(inputRefContainer);
            } else if (overlapType === 'annotated_ref_overlap' && jsonData.instance.references.length > 0) {
              inputRefContainer.textContent = `Reference: ${jsonData.instance.references.join("\n ")}`;
              annotationsContainer.appendChild(inputRefContainer);
            } 
  
            const paragraphContainer = document.createElement("div");
            paragraphContainer.classList.add("paragraph-container");

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

            paragraphsContainer.appendChild(annotationsContainer);
            paragraphsContainer.appendChild(paragraphContainer);
          });
        });

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

  const filenameInput = document.getElementById("jsonl-file");
  filenameInput.addEventListener("change", function() {

    const filename = document.getElementById("jsonl-file").value;

    const paragraphsContainer = document.getElementById("paragraphs-container");
    paragraphsContainer.innerHTML = "";

    loadJSONL(filename);
  });

  filenameInput.addEventListener("click", function() {
    filenameInput.value = "";
    filenameInput.focus();
  });
});
