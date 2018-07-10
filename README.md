# Standard Ontology Visualization
### A framework for visualizing Standard Ontology data

## Introduction

Standard Ontology Visualization is a [d3-based](https://d3js.org/) framework designed for visualizing Industry 4.0 Standards and their relations. The data used in this project is available at the [Standard Ontology](https://github.com/i40-Tools/StandardOntology) repository.

## Running the project

This project is live at https://i40-tools.github.io/StandardOntologyVisualization/

Alternatively, you can also downlaod the repository and open ```index.html``` using your browser.

Currently supported browsers:

- Google Chrome
- Mozilla Firefox

Please note you will need a working internet connection for the visualizations to load.

## List of Visualizations

### 1. Framework
#### A hierarchical view of Initiatives, Classifications and Standards
![Standards Packed Circle Chart](https://raw.githubusercontent.com/i40-Tools/StandardOntologyVisualization/master/static/images/standards.PNG)

This chart represents the hierarchical relationship between Standards, the Classifications they fall under, and the Initiatives which define the classifications.

The largest circles represent initiatives. Circles contained within the biggest circle are the classifications defined by that initiative. Similarly the smallest circles represent the standards defined within a particular classification. 

Clicking on any of the circles in the chart zooms in on the element and displays its details in the sidebar on the right. Users can use the search bar to search for any standards, classifications or initiatives. The breadcrumb trail on top of the chart also helps users navigate between elements.

### 2. Locations
#### Geographical map of the headquarters of Standards Organizations
![Headquarters Map](https://raw.githubusercontent.com/i40-Tools/StandardOntologyVisualization/master/static/images/map.PNG)



### 3. Timeline
#### Chronological view of the formation dates of Standards Organizations
![Standards Packed Circle Chart](https://raw.githubusercontent.com/i40-Tools/StandardOntologyVisualization/master/static/images/timeline.PNG)

### 4. Network
#### Network diagram of Standards and their relations
![Standards Packed Circle Chart](https://raw.githubusercontent.com/i40-Tools/StandardOntologyVisualization/master/static/images/network.png)

## Currently in Development
- Displaying Standards which have no relations in 'Network'
- Implementing semantic zoom over all views

