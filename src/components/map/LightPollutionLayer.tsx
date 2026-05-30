"use client";

import { useEffect, useRef } from "react";
import type { Map, MapMouseEvent } from "maplibre-gl";
import maplibregl from "maplibre-gl";

interface LightPollutionLayerProps {
  map: Map;
  visible: boolean;
  opacity?: number;
}

const SOURCE_ID = "light-pollution";
const LAYER_ID = "light-pollution-layer";
// Full 695K dataset: /tiles/light-pollution.geojson (107 MB)
const GEOJSON_URL = "/tiles/light-pollution-lite.geojson";

function row(label: string, value: string): string {
  return `
    <div class="lp-popup-row">
      <span class="lp-popup-label">${label}</span>
      <span class="lp-popup-value">${value}</span>
    </div>`;
}

const COLOR_EXPRESSION = [
  "match",
  ["get", "darkness_class"],
  1,
  "#00008B",
  2,
  "#4169E1",
  3,
  "#FFA500",
  4,
  "#FF4500",
  5,
  "#FF0000",
  "#888888",
] as const;

export function LightPollutionLayer({
  map,
  visible,
  opacity = 0.7,
}: LightPollutionLayerProps) {
  const addedRef = useRef(false);

  useEffect(() => {
    if (addedRef.current) return;

    const addLayer = () => {
      if (map.getSource(SOURCE_ID)) return;

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: GEOJSON_URL,
      });

      const firstSymbolId = map
        .getStyle()
        .layers?.find((l) => l.type === "symbol")?.id;

      map.addLayer(
        {
          id: LAYER_ID,
          type: "circle",
          source: SOURCE_ID,
          paint: {
            "circle-color": COLOR_EXPRESSION as never,
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              2,
              5,
              4,
              10,
              8,
              15,
              12,
            ],
            "circle-opacity": opacity,
            "circle-stroke-width": 0,
          },
        },
        firstSymbolId,
      );

      addedRef.current = true;
    };

    if (map.isStyleLoaded()) {
      addLayer();
    } else {
      map.on("style.load", addLayer);
      return () => {
        map.off("style.load", addLayer);
      };
    }
  }, [map]);

  useEffect(() => {
    if (!addedRef.current) return;
    if (!map.getLayer(LAYER_ID)) return;
    map.setLayoutProperty(LAYER_ID, "visibility", visible ? "visible" : "none");
  }, [map, visible]);

  useEffect(() => {
    if (!addedRef.current) return;
    if (!map.getLayer(LAYER_ID)) return;
    map.setPaintProperty(LAYER_ID, "circle-opacity", opacity);
  }, [map, opacity]);

  useEffect(() => {
    if (!addedRef.current) return;

    const popupRef = { current: null as maplibregl.Popup | null };

    const handleClick = (e: MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const props = feature.properties as Record<string, unknown>;
      const radiance = props.radiance ?? props.viirs_radiance;
      const sqmEstimate = props.sqm_estimate;
      const darknessClass = props.darkness_class;
      const bortleEstimate = props.bortle_estimate;
      const sourceYear = props.source_year;

      popupRef.current?.remove();

      const rows: string[] = [];

      if (radiance != null) {
        rows.push(row("VIIRS 辐亮度", `${Number(radiance).toFixed(2)} nW/cm²/sr`));
      }
      if (sqmEstimate != null) {
        rows.push(row("估算 SQM", `${Number(sqmEstimate).toFixed(1)} mag/arcsec²`));
      }
      if (darknessClass != null) {
        rows.push(row("暗天等级", `Class ${darknessClass}`));
      }
      if (bortleEstimate != null) {
        rows.push(row("估算 Bortle", `${bortleEstimate}`));
      }
      if (sourceYear) {
        rows.push(row("数据年份", `${sourceYear}`));
      }

      if (rows.length === 0) {
        const html = `
          <div class="lp-popup">
            <div class="lp-popup-empty">无数据</div>
          </div>`;
        const popup = new maplibregl.Popup({ closeButton: true, maxWidth: "240px" })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
        popupRef.current = popup;
        return;
      }

      const html = `
        <div class="lp-popup">
          <div class="lp-popup-title">光污染数据</div>
          ${rows.join("")}
          <div class="lp-popup-disclaimer">VIIRS 估算值，非实测 Bortle</div>
        </div>`;

      const popup = new maplibregl.Popup({ closeButton: true, maxWidth: "260px" })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
      popupRef.current = popup;
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", LAYER_ID, handleClick);
    map.on("mouseenter", LAYER_ID, handleMouseEnter);
    map.on("mouseleave", LAYER_ID, handleMouseLeave);

    return () => {
      map.off("click", LAYER_ID, handleClick);
      map.off("mouseenter", LAYER_ID, handleMouseEnter);
      map.off("mouseleave", LAYER_ID, handleMouseLeave);
      popupRef.current?.remove();
    };
  }, [map]);

  useEffect(() => {
    return () => {
      if (!map.getStyle()) return;
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      addedRef.current = false;
    };
  }, [map]);

  return null;
}
