
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
          const paragraphData = jsonData.annotated_entry_overlap;

          // Create a container for the annotations data
          const annotationsContainer = document.createElement("div");
          annotationsContainer.classList.add("annotations");

          // Display scenario_spec, split, part, instance_id, counts, and weighted_counts
          const scenarioSpec = jsonData.entry_data_overlap_key.stats_key.light_scenario_key.scenario_spec;
          const split = jsonData.entry_data_overlap_key.stats_key.light_scenario_key.split;
          const part = jsonData.entry_data_overlap_key.part;
          const instanceId = jsonData.entry_data_overlap_key.instance_id;
          const counts = jsonData.counts;
          const weightedCounts = jsonData.weighted_counts;

          const annotationsData = document.createElement("pre");
          annotationsData.textContent = `Scenario Spec: ${JSON.stringify(scenarioSpec, null, 2)}\nSplit: ${split}\nPart: ${part}\nInstance ID: ${instanceId}\nCounts: ${counts}\nWeighted Counts: ${weightedCounts}`;
          annotationsContainer.appendChild(annotationsData);

          // Create a container for the main paragraph content
          const paragraphContainer = document.createElement("div");
          paragraphContainer.classList.add("paragraph-container");

          // Create the paragraph content
          const paragraphElement = document.createElement("p");
          let paragraphHTML = "";

          let bold_counter = 0;
          paragraphData.forEach(([word, count], i) => {

            let wordElement = `<span data-count="${count}">${word}</span>`;

            if (count > 0) {
              wordElement = `<span class="bold" data-count="${count}">${word}</span>`;
              bold_counter = 12;
            }
            else {
              if (bold_counter > 0) {
                bold_counter -= 1
                wordElement = `<span class="bold" >${word}</span>`;;
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
    const loadButton = document.getElementById("load-button");
    loadButton.addEventListener("click", function () {
      const filenameInput = document.getElementById("jsonl-file");
      const filename = filenameInput.value + '.jsonl';

      // Clear existing content from paragraphs container
      const paragraphsContainer = document.getElementById("paragraphs-container");
      paragraphsContainer.innerHTML = "";

      // Load JSONL data with the given filename
      loadJSONL(filename);
    });

});