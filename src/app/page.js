import Dashboard from './component/dashboard/dashboard';
const Home = () => {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com"  />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

 
    <div className=' h-[100%] w-[90%]' >

      <div style={{ 
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        height:'100%',

      }}>
<Dashboard></Dashboard>
      </div>
      
    </div> 
    </> 
  );
};

export default Home;
