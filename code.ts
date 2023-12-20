figma.showUI(__html__, { width: 500, height: 600 });

figma.ui.onmessage = msg => {
    switch (msg.type) {
        case 'generate-tints':
            generateTints(msg);
            break;
        case 'cancel':
            figma.closePlugin();
            break;
    }
};

interface TintMessage {
  color: string;
  colorName: string;
  numTints: number;
  circleSize: number;
  circleSpacing: number;
  orientation: 'horizontal' | 'vertical';
}

function generateTints(msg: TintMessage): void {
  // Convert the color from hex to RGB
  const rgbColor = hexToRgb(msg.color);

  // Generate tints based on the color and numTints
  const tints = generateTintsFromColor(rgbColor, msg.numTints);

  // Create circles and arrange them
  const createdNodes = createAndArrangeCircles(tints, msg);

  // Scroll and zoom into the created nodes
  figma.viewport.scrollAndZoomIntoView(createdNodes);

  figma.closePlugin();
}

function generateTintsFromColor(baseColor: RGB, numTints: number): RGB[] {
  let tints: RGB[] = [];

  for (let i = 1; i <= numTints; i++) {
      let tintFactor = i / (numTints + 1);
      let tint: RGB = {
          r: baseColor.r + (1 - baseColor.r) * tintFactor,
          g: baseColor.g + (1 - baseColor.g) * tintFactor,
          b: baseColor.b + (1 - baseColor.b) * tintFactor
      };
      tints.push(tint);
  }

  return tints;
}

function createAndArrangeCircles(tints: RGB[], msg: TintMessage): SceneNode[] {
  let x = 0, y = 0;
  let nodes: SceneNode[] = [];

  tints.forEach(tint => {
      // Create a circle node
      const circle = figma.createEllipse();
      circle.resize(msg.circleSize, msg.circleSize);
      circle.fills = [{ type: 'SOLID', color: tint }];

      // Position the circle
      circle.x = x;
      circle.y = y;
      nodes.push(circle); // Add the circle to the nodes array

      // Update x and y for the next circle
      if (msg.orientation === 'horizontal') {
          x += msg.circleSize + msg.circleSpacing;
      } else {
          y += msg.circleSize + msg.circleSpacing;
      }
  });

  return nodes;
}

// Utility function to convert hex color to RGB
function hexToRgb(hex: string): RGB {
  // Remove hash if it's there
  hex = hex.replace(/^#/, '');

  // Parse the hex color string
  let r: number, g: number, b: number;

  if (hex.length === 3) {
      // If it's a shorthand hex color (e.g., #FFF)
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else if (hex.length === 6) {
      // If it's a full hex color (e.g., #FFFFFF)
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
  } else {
      throw new Error("Invalid hex color format");
  }

  // Convert to Figma RGB format (values between 0 and 1)
  return {
      r: r / 255,
      g: g / 255,
      b: b / 255
  };
}

// // This plugin will open a window to prompt the user to enter a number, and
// // it will then create that many rectangles on the screen.

// // This file holds the main code for plugins. Code in this file has access to
// // the *figma document* via the figma global object.
// // You can access browser APIs in the <script> tag inside "ui.html" which has a
// // full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// // This shows the HTML page in "ui.html".
// figma.showUI(__html__);

// // Calls to "parent.postMessage" from within the HTML page will trigger this
// // callback. The callback will be passed the "pluginMessage" property of the
// // posted message.
// figma.ui.onmessage = msg => {
//   // One way of distinguishing between different types of messages sent from
//   // your HTML page is to use an object with a "type" property like this.
//   if (msg.type === 'create-rectangles') {
//     const nodes: SceneNode[] = [];
//     for (let i = 0; i < msg.count; i++) {
//       const rect = figma.createRectangle();
//       rect.x = i * 150;
//       rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
//       figma.currentPage.appendChild(rect);
//       nodes.push(rect);
//     }
//     figma.currentPage.selection = nodes;
//     figma.viewport.scrollAndZoomIntoView(nodes);
//   }

//   // Make sure to close the plugin when you're done. Otherwise the plugin will
//   // keep running, which shows the cancel button at the bottom of the screen.
//   figma.closePlugin();
// };
