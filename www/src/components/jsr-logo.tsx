export default function JSRLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 13 7" {...props}>
      <title>JSR Logo</title>
      <path d="M0 2h2V0h7v1h4v4h-2v2H4V6H0" fill="#083344" />
      <path d="M1 3h1v1h1V1h1v4H1m4-4h3v1H6v1h2v3H5V5h2V4H5m4-2h3v2h-1V3h-1v3H9" fill="#f7df1e" />
    </svg>
  );
}
