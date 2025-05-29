
import styles from './dachbord.module.css'
const toothInfoCard = (item) => {
    return (
      <div>
        <div>
            <div>
                <img  style= {{width: '100%' ,height:"20px",filter: '',}} src={`21.jpg `}                />
            </div>
            <div>
                <div>Tooth {item.N}</div>
                <div>add </div>
            </div>
        </div>
        <div></div>
        <div></div>
      </div>
    );
  };
  
  export default Dashboard;