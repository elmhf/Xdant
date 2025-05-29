"use client"
import React, { useEffect, useState } from 'react';
import { Tag } from 'rsuite';
import { Tabs, Placeholder } from 'rsuite';
const ArrayProblems = [
  'Tooth Decay', 'Gingivitis', 'Bad Breath or Halitosis', 'Sensitive Teeth',
  'Dry Mouth', 'Teeth Grinding', 'Enamel Erosion', 'Cracked or Broken Teeth',
  'Receding Gums', 'Root Infection'
];

export function ProblemPicker({ value, setValue }) {
  const [selected, setSelected] = useState(null);

  const onSelect = (problem) => {
    setSelected(problem);
    setValue(problem);
  };

  useEffect(() => {
    setSelected(value);
  }, [value]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {ArrayProblems.map((problem, index) => (
        <Tag
          key={index}
          onClick={() => onSelect(problem)}
          style={{
            margin: "0",
            cursor: 'pointer',
            backgroundColor: selected === problem ? '#3498ff' : '#f0f0f0',
            color: selected === problem ? 'white' : 'black',
            border: selected === problem ? '1px solid #2980b9' : '1px solid #ccc',
          }}
        >
          {problem}
        </Tag>
      ))}
    </div>
  );
}


const severityLevels = [
    "Very Mild",       // Barely noticeable, no pain
    "Mild",            // Some sensitivity or discomfort
    "Moderate",        // Consistent pain or visible issues
    "Severe",          // Strong pain, may affect daily life
    "Critical/Urgent"  // Emergency situation (abscess, intense swelling, etc.)
  ];
  const progressionStages = [
    "Initial",       // Early signs, maybe just visible plaque or tiny cavity
    "Developing",    // Issue is growing, maybe mild symptoms
    "Moderate",      // Decay or damage is visible, pain starting
    "Advanced",      // Deep decay, gum involvement, root issues
    "Critical"       // Major damage or infection — urgent treatment needed
  ];
export  function ProblemSeverityinput() {
  return (
    <Tabs defaultActiveKey="0" appearance="pills">
    {
        severityLevels.map((level,index)=>{
            return <Tabs.Tab eventKey={`${index}`} title={`${level}`}>
    </Tabs.Tab>
        })
    }
  </Tabs>
  )
}

export  function ProblemProgressioninput() {
    return (
      <Tabs defaultActiveKey="0" appearance="pills">
      {
          progressionStages.map((level,index)=>{
              return <Tabs.Tab eventKey={`${index}`} title={`${level}`}>
      </Tabs.Tab>
          })
      }
    </Tabs>
    )
  }

