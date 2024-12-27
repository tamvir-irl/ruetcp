"use client"
import React from "react";
import { Card, CardBody, CardHeader, Spacer } from "@nextui-org/react";
import { resources } from "../../config/resources";
import LinkPreview from '../../components/linkpreview';


const Resources = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 className="text-3xl font-bold" style={{ marginBottom: "1rem" }}>{resources.title}</h1>
      <div className="flex flex-wrap flex-col gap-2">
        {resources.links.map((link, index) => (
          <div style={{ flex: "1 1 calc(33.333% - 1rem)", minWidth: "300px" }} key={index}>
            <Card >
              <CardHeader>
                <h3 style={{ margin: 0 }}>{link.label} : <span className="text-blue-300">{link.href}</span></h3>
              </CardHeader>
              <CardBody>
                <LinkPreview url={link.href} />
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
