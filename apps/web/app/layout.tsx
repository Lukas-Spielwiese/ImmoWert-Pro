import './styles.css';
export const metadata={title:'ImmoWert Pro – ImmoWertV 2021'};
export default function RootLayout({children}:{children:React.ReactNode}){
  return (<html lang='de'><body style={{fontFamily:'system-ui',margin:20}}>{children}</body></html>);
}
