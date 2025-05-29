'use client'

import React, { useState, useEffect, useContext,createContext, memo } from "react";
import styles from './ToothCaard.module.css'
import RanderImages from "./problrms/randerImages";
import CommentBoxTextarea from "./component/CommentBoxTextarea";
import CommetBoX from "./component/CommetBoX";
import CardButton from "./cardButton/CardButton";
import useToothEdit from "../../JsFiles/editwithData";
import AddProblem from "./AddProblem";
import CommetButton from './cardButton/CommetButton'
import { HStack,Divider,Button } from "rsuite"; 
import CheckIcon from '@rsuite/icons/Check';
import { DataContext } from "../../dashboard";
import { useTranslation } from "react-i18next";


import { useLayout } from "@/stores/setting";

const ToothDiagnosis = memo(({item,idCard}) => {
    const { ToothNumberSelect,seToothNumberSelect } = useContext(DataContext);

    const { currentLayout, isFullscreen, applyLayout, toggleFullscreen } = useLayout();
  const { ToothEditData, setToothEditData } = useContext(DataContext);
  const { editwithData } = useToothEdit();
  const [cropImage ,setcropImage] =useState({});
  const backgroundColorInfoToothImag = `rgba(var(--color-${item.category}), 0.2)`; 
  const borderColorInfoToothImag = `rgba(var(--color-${item.category}), 0.5)`;
  const [Hedding, setHedding] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const { t } = useTranslation();
useEffect(() => {
  
  {editwithData({"idcard":idCard ,"HeddingSet":{Hedding, setHedding}})}
}, [ToothEditData]);


  const ToothProblem = ({ problems }) => {
    

    if(!problems){
      problems=[]
    }
    
    if ( problems.length==0) {
     
      return<div style={{display:'flex', gap:"10px",padding:" 5px 10px", borderRadius:"7px" ,  cursor:'pointer',color:"white", backgroundColor: `rgba(var(--color-Healthy), 0.2)`,
    }}>
          <div style={{color:"white"} }>{t( "side.card.NoProblemsDetected" )}</div>
        </div>;


    }else{
      return (
        <>
          {
           
          problems.map((problem, index) => (
  
  
  <>      <div key={idCard+index} style={{display:'flex', gap:"10px",padding:" 5px 10px", borderRadius:"7px" ,color:"white" , cursor:'pointer',backgroundColor: `rgba(var(--color-Healthy))`,
            border: `solid 1px rgba(var(--color-Healthy), 0.5)`,}}>
              <div>{problem.type}</div>
              <div>
              {problem.confidence}
              </div>
            </div>
  
            {
  
            }</>
      
          ))
       
          }
        </>
      );
    }

  };
  

  const AddProblemBu=()=>{
    return(

<AddProblem teeth={item}/>
    );
  }
  return (

    <div className={`parent ${styles.uncollapsedCard}   ` } idCard={idCard} onClick={()=>{
      applyLayout('NEW_LAYOUT');
      seToothNumberSelect(idCard)}}  >

    
    <div className={` ${styles.main}   cardsBorder`} >
    <div style={{position:"absolute",right:"10px"}} >
    </div>
        <div className={styles.Info}  idCard={idCard} >

        <div className={styles.InfoImageTooth} style={{backgroundColor:backgroundColorInfoToothImag,border :` solid 2px ${borderColorInfoToothImag} `}}  idCard={idCard} >
            <img
                style={{ width: "10px", filter: "" }}
                src={`/${item.toothNumber}.png`} 
              />
            </div>
            
            <div>

            <div className={styles.ToothNumberText}>{t('side.card.Tooth')} {item.toothNumber}</div>
            <div className={`${styles.InfoProblemsTooth}`}  idCard={idCard}  ><ToothProblem problems={item.problems}></ToothProblem> </div>

            </div>
      
        </div>
        


        <div className={styles.Images}  idCard={idCard}  >
          <RanderImages viewModeState={{viewMode, setViewMode}} teeth={item}/>
        </div>
        
        <div  idCard={idCard}   className={`Commet ${styles.Commet}`}  style={{display: "flex",alignItems: "flex-end"}}>       
            <CardButton teeth={item} idcard={idCard} viewModeState={{viewMode, setViewMode}} />
        </div>
       </div>
        
  </div>
  

    
);
})
export default ToothDiagnosis;