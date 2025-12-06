import React from "react";

const BackgroundLayer: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden"
    //   style={{
    //     backgroundColor: "#C5C5C5",
    //   }}
    >
      <style>{`
        @keyframes scan-down {
          0% { mask-position: 0% -100%; -webkit-mask-position: 0% -100%; }
          100% { mask-position: 0% 400%; -webkit-mask-position: 0% 400%; }
        }
        @keyframes scan-right {
          0% { mask-position: -100% 0%; -webkit-mask-position: -100% 0%; }
          100% { mask-position: 400% 0%; -webkit-mask-position: 400% 0%; }
        }
      `}</style>

      {/* Main gradient background */}
      <div
        className="absolute inset-0"
        style={{
          height: "320px",
          background: "linear-gradient(to bottom, #D3D3D3 10%, #FFFFFF 90%)",

          /* Create a semicircle shape that fades outward */
          WebkitMaskImage: `
      radial-gradient(
        circle at top center,
        black 60%,
        transparent 130%
      )
    `,
          maskImage: `
      radial-gradient(
        circle at top center,
        black 60%,
        transparent 100%
      )
    `
        }}
      />


      {/* Static Gray Grid */}
      <div

        className=""
        style={{
          height: "520px",
          width: "100%",
          backgroundImage: `
            linear-gradient( #d2d2d6ff 1px, transparent 2px),
            linear-gradient(to right, #d2d2d6ff 1px, transparent 2px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at top, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at top, black 30%, transparent 70%)",
        }}
      />


    </div>

  );
};

export default BackgroundLayer;
