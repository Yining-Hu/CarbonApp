import React from 'react';
import Mermaid from "mermaid";

Mermaid.initialize({
    startOnLoad: true,
    theme: "default",
    securityLevel: "loose",
    fontFamily: "Fira Code"
  });

export default class MyMermaid extends React.Component {
    componentDidMount() {
        Mermaid.contentLoaded();
    }
    render() {
        return <div>
            <h2>Escrow Sequence</h2>
            <div className="mermaid">{this.props.chart}</div>;
          </div>
    }
}
