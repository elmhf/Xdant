import { Button } from "@material-tailwind/react";
 
export default function SettingButton() {
  return (
    <div className="flex w-max gap-4" style={{
       backgroundColor: `rgba(var( --color-Healthy), 0.2)`,
      border: `solid 1px rgba(var( --color-Healthy), 0.5)`,
      borderRadius:'var(  --Border-Radios)'
    }}>
      <Button style={{padding:"10px 30px", textDecorationColor:'rgba(var( --color-Healthy), 0.5)' }} variant="gradient">Setting</Button>
    </div>
  );
}