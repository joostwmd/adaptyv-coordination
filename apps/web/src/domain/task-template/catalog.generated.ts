/* eslint-disable -- generated file */
import type { TaskTemplateBase } from "./types";

/** Auto-generated from data/lab-runner/task-templates.json — do not edit by hand. */
export const TASK_TEMPLATE_BASES: TaskTemplateBase[] = [
  {
    id: "f94f1058-8e24-4471-aa8b-406b0564cfbf",
    name: "BLI Plate Prep",
    durationMinutes: 90,
    plateTypeId: "01915ab3-c658-f6d8-6df0-ed8d6cb602ad",
    machineTypeId: undefined,
    paramSchema: {
        "title": "BLI Plate Prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "kinetics",
                "type": "select",
                "required": false,
                "default": "MCK",
                "options": [
                    "MCK",
                    "SCK"
                ]
            },
            {
                "name": "overhead",
                "type": "number",
                "required": false,
                "unit": "%",
                "default": 20
            },
            {
                "name": "probe_lot",
                "type": "string",
                "required": false,
                "title": "Probe LOT Number"
            },
            {
                "name": "target_stocks",
                "type": "array",
                "required": false,
                "itemFields": [
                    {
                        "name": "plate_id",
                        "type": "string",
                        "required": true,
                        "title": "Plate ID"
                    },
                    {
                        "name": "plate_code",
                        "type": "string",
                        "required": false,
                        "title": "Plate Code"
                    },
                    {
                        "name": "dilution_factor",
                        "type": "select",
                        "required": false,
                        "default": "half-log",
                        "options": [
                            "2-fold",
                            "half-log",
                            "log"
                        ],
                        "description": "Dilution factor"
                    },
                    {
                        "name": "material_stock_id",
                        "type": "string",
                        "required": true,
                        "title": "Inventory Stock"
                    },
                    {
                        "name": "starting_concentration",
                        "type": "number",
                        "required": false,
                        "unit": "nM",
                        "default": 1000,
                        "description": "Concentration in nM"
                    },
                    {
                        "name": "number_of_concentrations",
                        "type": "number",
                        "required": false,
                        "default": 4,
                        "description": "Number of concentrations"
                    }
                ]
            },
            {
                "name": "running_buffer",
                "type": "string",
                "required": true,
                "default": "Buffer K"
            },
            {
                "name": "a_plate_well_volume",
                "type": "number",
                "required": false,
                "unit": "uL",
                "default": 48
            },
            {
                "name": "final_dilution_factor",
                "type": "number",
                "required": true,
                "default": 40,
                "description": "Dilution Factor in loading plate"
            },
            {
                "name": "b_and_c_plate_well_volume",
                "type": "number",
                "required": false,
                "unit": "uL",
                "default": 40
            },
            {
                "name": "expression_dilution_factor",
                "type": "number",
                "required": true,
                "default": 5,
                "description": "Dilution Factor of expression plate"
            }
        ]
    },
  },
  {
    id: "1fa2fc3f-adc6-46df-96cb-cafc71f7e7c9",
    name: "BLI Run",
    durationMinutes: 300,
    plateTypeId: "01915ab3-c658-f6d8-6df0-ed8d6cb602ad",
    machineTypeId: "0ac01c79-7965-4f92-890e-58e9f9f90299",
    paramSchema: {
        "title": "BLI Run",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "probes_type",
                "type": "select",
                "required": false,
                "default": "Strep-Tactin XT",
                "options": [
                    "Strep-Tactin XT",
                    "SA XT",
                    "Anti-Human IgG Fc Gen II",
                    "Anti-His",
                    "Protein A",
                    "Anti-Mouse IgG Fc",
                    "Anti-VHH"
                ]
            }
        ]
    },
  },
  {
    id: "01944581-afc2-2a97-3ba6-14b9cbc54691",
    name: "Buffer Prep",
    durationMinutes: 120,
    plateTypeId: undefined,
    machineTypeId: undefined,
    paramSchema: {
        "title": "Buffer prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "buffer_k",
                "type": "number",
                "required": true,
                "unit": "L",
                "default": 1,
                "description": "Volume in L"
            },
            {
                "name": "buffer_r",
                "type": "number",
                "required": true,
                "unit": "L",
                "default": 0.5,
                "description": "Volume in L"
            },
            {
                "name": "buffer_be",
                "type": "number",
                "required": true,
                "unit": "L",
                "default": 1,
                "description": "Volume in L"
            }
        ]
    },
  },
  {
    id: "0196a08b-9a6f-5987-9a0e-d146bf54f206",
    name: "Capillary Electrophoresis Prep",
    durationMinutes: 60,
    plateTypeId: "0196ee7c-3c1c-3288-6a28-26d47c3a1c05",
    machineTypeId: undefined,
    paramSchema: {
        "title": "Capillary Electrophoresis Prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "assay_type",
                "type": "select",
                "required": true,
                "default": "High Sensitivity Assay",
                "options": [
                    "High Sensitivity Assay",
                    "Standard Assay"
                ]
            },
            {
                "name": "sample_prep_redox_state",
                "type": "select",
                "required": false,
                "default": "Non-Reduced",
                "options": [
                    "Reduced",
                    "Non-Reduced"
                ]
            }
        ]
    },
  },
  {
    id: "0196a0a3-4819-49d2-3023-0dee9162286c",
    name: "Capillary Electrophoresis Run",
    durationMinutes: 60,
    plateTypeId: "0196ee7c-3c1c-3288-6a28-26d47c3a1c05",
    machineTypeId: "bb6f5204-50a9-4cad-87b2-d475107ab615",
    paramSchema: {
        "title": "Capillary Electrophoresis Run",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "chip_type",
                "type": "select",
                "required": true,
                "default": "Protein Express",
                "options": [
                    "Protein Express",
                    "DNA 5K/RNA",
                    "Other"
                ]
            },
            {
                "name": "raw_data_file",
                "type": "string",
                "required": false
            },
            {
                "name": "assay_condition",
                "type": "select",
                "required": true,
                "default": "Non-Reduced",
                "options": [
                    "Reduced",
                    "Non-Reduced",
                    "Not Applicable",
                    "Other"
                ]
            }
        ]
    },
  },
  {
    id: "01934918-c6ef-7c6e-e6b1-c376322cc1b4",
    name: "CFE Prep",
    durationMinutes: 180,
    plateTypeId: undefined,
    machineTypeId: undefined,
    paramSchema: {
        "title": "CFE Prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "kit_size",
                "type": "string",
                "required": true,
                "default": "L"
            },
            {
                "name": "kit_type",
                "type": "string",
                "required": true,
                "default": "PUREfrex 2.1"
            },
            {
                "name": "total_volume",
                "type": "number",
                "required": true,
                "unit": "uL",
                "default": 1500,
                "description": "Volume in uL"
            }
        ]
    },
  },
  {
    id: "0195d904-2b1b-87ab-2cf3-e2b7bb206714",
    name: "Cherry Picking",
    durationMinutes: 60,
    plateTypeId: "01915ab3-7191-187f-e41f-272e8b98abb4",
    machineTypeId: "469e1c54-785e-41c6-a77d-875d3a9808f5",
    paramSchema: {
        "title": "Cherry Picking",
        "fields": []
    },
  },
  {
    id: "019a727e-09cd-6a39-36de-3fc7aaf8ca4b",
    name: "Combine plates",
    durationMinutes: 60,
    plateTypeId: "0191dc24-1076-4efb-d284-57469b427870",
    machineTypeId: "469e1c54-785e-41c6-a77d-875d3a9808f5",
    paramSchema: {
        "title": "Combine plates",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            }
        ]
    },
  },
  {
    id: "01909d1e-1fdf-c8dc-ae7e-72ab364800b7",
    name: "Data Analysis",
    durationMinutes: 60,
    plateTypeId: undefined,
    machineTypeId: undefined,
    paramSchema: {
        "fields": []
    },
  },
  {
    id: "1dc35aba-79f2-423f-bfad-1042ee19e6fd",
    name: "DNA Dilution",
    durationMinutes: 60,
    plateTypeId: "01915ab4-ce85-34e1-6a6b-2d45bdcf748b",
    machineTypeId: "469e1c54-785e-41c6-a77d-875d3a9808f5",
    paramSchema: {
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            }
        ]
    },
  },
  {
    id: "01909d1c-7da1-79aa-fe76-4c350d61a79c",
    name: "DNA Reconstitution",
    durationMinutes: 60,
    plateTypeId: "0191dc24-1076-4efb-d284-57469b427870",
    machineTypeId: "469e1c54-785e-41c6-a77d-875d3a9808f5",
    paramSchema: {
        "title": "DNA Reconstitution",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "target_concentration",
                "type": "number",
                "required": true,
                "unit": "nM",
                "default": 100,
                "description": "Concentration in nM"
            }
        ]
    },
  },
  {
    id: "019662b2-9810-c712-7501-98b5b6a68b58",
    name: "Expression Dilution",
    durationMinutes: 30,
    plateTypeId: "01915ab3-7191-187f-e41f-272e8b98abb4",
    machineTypeId: "469e1c54-785e-41c6-a77d-875d3a9808f5",
    paramSchema: {
        "title": "Expression Dilution",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "final_volume",
                "type": "number",
                "required": false,
                "default": 30
            },
            {
                "name": "dilution_factor",
                "type": "number",
                "required": true,
                "default": 5,
                "description": "Dilution factor"
            }
        ]
    },
  },
  {
    id: "a52e40c7-db76-46fe-bdc5-bf51522457c1",
    name: "Expression Plate Prep",
    durationMinutes: 60,
    plateTypeId: "01915ab3-7191-187f-e41f-272e8b98abb4",
    machineTypeId: undefined,
    paramSchema: {
        "title": "Expression Plate Prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "CFE Batch",
                "type": "string",
                "required": false,
                "default": "CFE-"
            },
            {
                "name": "expression_media",
                "type": "string",
                "required": true,
                "default": "PUREfrex 2.1"
            },
            {
                "name": "expression_volume",
                "type": "number",
                "required": true,
                "unit": "uL",
                "default": 6,
                "description": "Volume in uL"
            },
            {
                "name": "expression_temperature",
                "type": "number",
                "required": false,
                "unit": "C",
                "default": 37
            }
        ]
    },
  },
  {
    id: "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c",
    name: "Expression Run",
    durationMinutes: 720,
    plateTypeId: "01915ab3-7191-187f-e41f-272e8b98abb4",
    machineTypeId: "7ec427d5-23b3-48d7-9045-340b1dd8b21a",
    paramSchema: {
        "title": "Expression Run",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "property_4",
                "type": "number",
                "required": false,
                "unit": "rpm",
                "default": "0",
                "title": "shaking",
                "description": "Shaking speed"
            },
            {
                "name": "expression_time",
                "type": "number",
                "required": true,
                "unit": "hours",
                "default": 12,
                "description": "Time in hours"
            },
            {
                "name": "expression_temperature",
                "type": "number",
                "required": true,
                "unit": "C",
                "default": 25,
                "description": "Temperature in degrees Celsius"
            }
        ]
    },
  },
  {
    id: "0197a17b-1929-35ec-481a-71898f21996b",
    name: "Maintenance",
    durationMinutes: 60,
    plateTypeId: undefined,
    machineTypeId: undefined,
    paramSchema: {
        "fields": []
    },
  },
  {
    id: "0194e030-e704-b9ad-ebc8-6cf4007d5e73",
    name: "Other",
    durationMinutes: 60,
    plateTypeId: undefined,
    machineTypeId: undefined,
    paramSchema: {
        "title": "Other",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            }
        ]
    },
  },
  {
    id: "019ada60-2c8e-e20f-c131-0bfaa144858e",
    name: "PCR Plate Prep",
    durationMinutes: 60,
    plateTypeId: "01932f34-04bc-9454-93d4-8c0370992ece",
    machineTypeId: "469e1c54-785e-41c6-a77d-875d3a9808f5",
    paramSchema: {
        "fields": [
            {
                "name": "n",
                "type": "string",
                "required": false,
                "title": "Notes"
            },
            {
                "name": "property_1",
                "type": "string",
                "required": false,
                "default": "Genie Fusion",
                "title": "Master Mix"
            },
            {
                "name": "property_2",
                "type": "string",
                "required": false,
                "default": "0",
                "title": "PCR volume"
            }
        ]
    },
  },
  {
    id: "0192f748-06d8-135a-8da0-06743bb66f12",
    name: "Protein Purification",
    durationMinutes: 90,
    plateTypeId: "01969fa0-50f9-0585-7660-028e108e04e0",
    machineTypeId: "469e1c54-785e-41c6-a77d-875d3a9808f5",
    paramSchema: {
        "title": "Protein Purification",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "beads_type",
                "type": "select",
                "required": false,
                "default": "Strep-Tactin XT beads",
                "options": [
                    "Strep-Tactin XT beads",
                    "His Monster Beads",
                    "Other"
                ]
            },
            {
                "name": "input_volume",
                "type": "number",
                "required": true,
                "unit": "uL",
                "default": 40,
                "description": "Input Volume in uL"
            },
            {
                "name": "elution_volume",
                "type": "number",
                "required": true,
                "unit": "uL",
                "default": 40,
                "description": "Elution Volume in uL"
            }
        ]
    },
  },
  {
    id: "01969f81-4f80-7a19-18e8-342b666f5d52",
    name: "QuantIt Plate Prep",
    durationMinutes: 60,
    plateTypeId: "019afd98-340b-5ba9-031f-a4c3b3540290",
    machineTypeId: undefined,
    paramSchema: {
        "title": "QuantIt Plate Prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "sample_volume",
                "type": "number",
                "required": false,
                "unit": "uL",
                "default": 2.5
            },
            {
                "name": "quant-it_volume",
                "type": "number",
                "required": false,
                "unit": "uL",
                "default": 22.5
            },
            {
                "name": "standard_volume",
                "type": "select",
                "required": false,
                "default": "2.75 uL - Biotin-Spiked Std Curve",
                "options": [
                    "2.5 uL - Normal Std Curve",
                    "2.75 uL - Biotin-Spiked Std Curve"
                ]
            }
        ]
    },
  },
  {
    id: "01969f84-eaa1-4377-f53e-f2a7064d47c7",
    name: "QuantIt Run",
    durationMinutes: 60,
    plateTypeId: "01969fa0-50f9-0585-7660-028e108e04e0",
    machineTypeId: "469e1c54-785e-41c6-a77d-875d3a9808f5",
    paramSchema: {
        "title": "QuantIt Run",
        "fields": [
            {
                "name": "gain",
                "type": "number",
                "required": true,
                "default": 860
            },
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "raw_data_file",
                "type": "string",
                "required": false
            }
        ]
    },
  },
  {
    id: "019afe60-8371-4716-ff31-bc24dc07ad32",
    name: "Quantit Standards Prep",
    durationMinutes: 15,
    plateTypeId: "0198ec14-d5ba-90f6-7829-5d406bb94ed3",
    machineTypeId: undefined,
    paramSchema: {
        "title": "Quantit Standards Prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            }
        ]
    },
  },
  {
    id: "01909d1e-85a5-fc3a-97f0-5a0773cfe3c9",
    name: "Review",
    durationMinutes: 60,
    plateTypeId: undefined,
    machineTypeId: undefined,
    paramSchema: {
        "fields": []
    },
  },
  {
    id: "45536063-fa83-45d4-a414-ea941402a52d",
    name: "Split GFP Materials Plate Prep",
    durationMinutes: 30,
    plateTypeId: "dba257be-a7f1-466b-8417-a315e9c53215",
    machineTypeId: undefined,
    paramSchema: {
        "title": "Split GFP Materials Plate Prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "well_volume",
                "type": "number",
                "required": false,
                "unit": "uL",
                "default": 2,
                "title": "Well Volume",
                "description": "Volume per well in uL"
            },
            {
                "name": "input_stocks",
                "type": "array",
                "required": false,
                "title": "GFP1-10 Reagent",
                "itemFields": [
                    {
                        "name": "plate_id",
                        "type": "string",
                        "required": true,
                        "title": "Plate ID"
                    },
                    {
                        "name": "plate_code",
                        "type": "string",
                        "required": false,
                        "title": "Plate Code"
                    },
                    {
                        "name": "material_stock_id",
                        "type": "string",
                        "required": true,
                        "title": "Inventory Stock"
                    }
                ]
            },
            {
                "name": "plates_count",
                "type": "number",
                "required": false,
                "default": 1,
                "title": "Number of Plates",
                "description": "Amount of plates in batch"
            }
        ]
    },
  },
  {
    id: "0198ec18-e981-2c52-1401-6a3e97527b07",
    name: "Split GFP Standards Prep",
    durationMinutes: 20,
    plateTypeId: "0198ec14-d5ba-90f6-7829-5d406bb94ed3",
    machineTypeId: undefined,
    paramSchema: {
        "title": "SplitGFP Standards Prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "well_volume",
                "type": "number",
                "required": false,
                "unit": "uL",
                "default": 6,
                "title": "Well Volume",
                "description": "Volume per well in µL"
            },
            {
                "name": "input_stocks",
                "type": "array",
                "required": false,
                "title": "Recombinant Protein Standard",
                "itemFields": [
                    {
                        "name": "plate_id",
                        "type": "string",
                        "required": true,
                        "title": "Plate ID"
                    },
                    {
                        "name": "plate_code",
                        "type": "string",
                        "required": false,
                        "title": "Plate Code"
                    },
                    {
                        "name": "material_stock_id",
                        "type": "string",
                        "required": true,
                        "title": "Inventory Stock"
                    }
                ]
            },
            {
                "name": "plates_count",
                "type": "number",
                "required": false,
                "default": 1,
                "title": "Number of Plates",
                "description": "Number of plates in batch"
            },
            {
                "name": "well_concentrations",
                "type": "array",
                "required": false,
                "default": [
                    6,
                    5,
                    4,
                    3,
                    2,
                    1,
                    0.5,
                    0
                ],
                "title": "Well Concentrations",
                "description": "Concentrations for each well from top to bottom (row A to H)"
            }
        ]
    },
  },
  {
    id: "019745e0-6bed-a163-c43c-1a7e6350d817",
    name: "Split-GFP Plate Prep",
    durationMinutes: 60,
    plateTypeId: "0193485c-a571-4e7c-e947-eed126702e4b",
    machineTypeId: undefined,
    paramSchema: {
        "title": "Split-GFP Plate Prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "property_3",
                "type": "number",
                "required": false,
                "unit": "X",
                "default": "5",
                "title": "Dilution Factor"
            },
            {
                "name": "materials_plate",
                "type": "string",
                "required": false,
                "title": "GFP Materials Plate",
                "description": "P-GMP plate with GFP reaction materials"
            },
            {
                "name": "standards_plate",
                "type": "string",
                "required": false,
                "title": "Standards Plate",
                "description": "P-SGS plate with standards"
            },
            {
                "name": "diluted_expression_volume",
                "type": "number",
                "required": false,
                "unit": "uL",
                "default": 4
            }
        ]
    },
  },
  {
    id: "0193485d-43e6-4dc7-0cee-e3095614bce7",
    name: "Split-GFP Run",
    durationMinutes: 1440,
    plateTypeId: "0193485c-a571-4e7c-e947-eed126702e4b",
    machineTypeId: undefined,
    paramSchema: {
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "raw_data_file",
                "type": "string",
                "required": false
            },
            {
                "name": "incubation_time",
                "type": "number",
                "required": false,
                "unit": "min",
                "default": 90
            }
        ]
    },
  },
  {
    id: "0197a17a-6a5e-c668-e903-b1f2cdfcff3c",
    name: "SPR Chip Prep",
    durationMinutes: 60,
    plateTypeId: undefined,
    machineTypeId: "7f873d69-af35-44f3-be22-0766fea0ad63",
    paramSchema: {
        "fields": []
    },
  },
  {
    id: "01979c72-1e66-2a8e-555b-3cf5c9f56a06",
    name: "SPR Prep",
    durationMinutes: 60,
    plateTypeId: "019875ea-d32d-f224-7884-525eabec4dfd",
    machineTypeId: "7f873d69-af35-44f3-be22-0766fea0ad63",
    paramSchema: {
        "title": "SPR Prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "chip_id",
                "type": "string",
                "required": false,
                "default": "CHIP-"
            },
            {
                "name": "target_stocks",
                "type": "array",
                "required": false,
                "itemFields": [
                    {
                        "name": "plate_id",
                        "type": "string",
                        "required": true,
                        "title": "Plate ID"
                    },
                    {
                        "name": "plate_code",
                        "type": "string",
                        "required": false,
                        "title": "Plate Code"
                    },
                    {
                        "name": "dilution_factor",
                        "type": "select",
                        "required": false,
                        "default": "half-log",
                        "options": [
                            "2-fold",
                            "half-log",
                            "log"
                        ],
                        "description": "Dilution factor"
                    },
                    {
                        "name": "material_stock_id",
                        "type": "string",
                        "required": true,
                        "title": "Inventory Stock"
                    },
                    {
                        "name": "starting_concentration",
                        "type": "number",
                        "required": false,
                        "unit": "nM",
                        "default": 1000,
                        "description": "Concentration in nM"
                    },
                    {
                        "name": "number_of_concentrations",
                        "type": "number",
                        "required": false,
                        "default": 5,
                        "description": "Number of concentrations"
                    }
                ]
            },
            {
                "name": "running_buffer",
                "type": "string",
                "required": false,
                "default": "HBSTE"
            },
            {
                "name": "final_dilution_factor",
                "type": "number",
                "required": false,
                "default": 100,
                "description": "Dilution Factor in loading plate"
            },
            {
                "name": "expression_dilution_factor",
                "type": "number",
                "required": false,
                "default": 5,
                "description": "Dilution Factor of expression plate"
            }
        ]
    },
  },
  {
    id: "01954733-5f3c-c54a-ac46-720de477e712",
    name: "SPR Run",
    durationMinutes: 480,
    plateTypeId: undefined,
    machineTypeId: "7f873d69-af35-44f3-be22-0766fea0ad63",
    paramSchema: {
        "title": "SPR Run",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            }
        ]
    },
  },
  {
    id: "0195cde5-39ff-097b-d552-929bef917ee5",
    name: "Target Onboarding",
    durationMinutes: 60,
    plateTypeId: undefined,
    machineTypeId: undefined,
    paramSchema: {
        "title": "Antigen Onboarding",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "probes_type",
                "type": "select",
                "required": false,
                "default": "Strep-Tactin XT",
                "options": [
                    "Strep-Tactin XT",
                    "SA XT",
                    "Anti-Human IgG Fc Gen II",
                    "Anti-His",
                    "Protein A",
                    "Anti-Mouse IgG Fc",
                    "Anti-VHH",
                    "APS"
                ],
                "title": "Default Probe Type"
            },
            {
                "name": "antigen_stocks",
                "type": "array",
                "required": false,
                "title": "Antigen Stocks",
                "itemFields": [
                    {
                        "name": "notes",
                        "type": "string",
                        "required": false,
                        "default": "",
                        "title": "Notes"
                    },
                    {
                        "name": "plate_id",
                        "type": "string",
                        "required": true,
                        "title": "Plate ID"
                    },
                    {
                        "name": "Probe_lot",
                        "type": "string",
                        "required": false,
                        "title": "Probe LOT Number"
                    },
                    {
                        "name": "plate_code",
                        "type": "string",
                        "required": false,
                        "title": "Plate Code"
                    },
                    {
                        "name": "material_stock_id",
                        "type": "string",
                        "required": true,
                        "title": "Inventory Stock"
                    },
                    {
                        "name": "onboarding_status",
                        "type": "select",
                        "required": false,
                        "default": "",
                        "options": [
                            "pass",
                            "uncertain",
                            "fail"
                        ],
                        "title": "Onboarding Status"
                    },
                    {
                        "name": "neutral_control_runs",
                        "type": "array",
                        "required": false,
                        "default": [
                            {
                                "outcome": "",
                                "results": [],
                                "buffer_type": "",
                                "probes_type": "Strep-Tactin XT"
                            }
                        ],
                        "title": "Neutral Control Runs",
                        "itemFields": [
                            {
                                "name": "outcome",
                                "type": "select",
                                "required": false,
                                "default": "",
                                "options": [
                                    "pass",
                                    "uncertain",
                                    "fail"
                                ],
                                "title": "Outcome"
                            },
                            {
                                "name": "results",
                                "type": "array",
                                "required": false,
                                "default": [],
                                "itemFields": [
                                    {
                                        "name": "key",
                                        "type": "string",
                                        "required": false,
                                        "title": "Concentration (nM)"
                                    },
                                    {
                                        "name": "value",
                                        "type": "string",
                                        "required": false,
                                        "title": "NSB (nM)"
                                    }
                                ]
                            },
                            {
                                "name": "buffer_type",
                                "type": "select",
                                "required": false,
                                "default": "",
                                "options": [
                                    "K",
                                    "L"
                                ],
                                "title": "Buffer Type"
                            },
                            {
                                "name": "probes_type",
                                "type": "select",
                                "required": false,
                                "default": "Strep-Tactin XT",
                                "options": [
                                    "Strep-Tactin XT",
                                    "SA XT",
                                    "Anti-Human IgG Fc Gen II",
                                    "Anti-His",
                                    "Protein A",
                                    "Anti-Mouse IgG Fc",
                                    "Anti-VHH",
                                    "APS"
                                ],
                                "title": "Probes Type"
                            }
                        ]
                    },
                    {
                        "name": "negative_control_runs",
                        "type": "array",
                        "required": false,
                        "default": [
                            {
                                "outcome": "",
                                "results": []
                            }
                        ],
                        "title": "Negative Control Runs",
                        "itemFields": [
                            {
                                "name": "outcome",
                                "type": "select",
                                "required": false,
                                "default": "",
                                "options": [
                                    "pass",
                                    "uncertain",
                                    "fail"
                                ],
                                "title": "Outcome"
                            },
                            {
                                "name": "results",
                                "type": "array",
                                "required": false,
                                "default": [],
                                "itemFields": [
                                    {
                                        "name": "key",
                                        "type": "string",
                                        "required": false,
                                        "title": "Concentration (nM)"
                                    },
                                    {
                                        "name": "value",
                                        "type": "string",
                                        "required": false,
                                        "title": "NSB (nM)"
                                    }
                                ]
                            },
                            {
                                "name": "buffer_type",
                                "type": "select",
                                "required": false,
                                "default": "",
                                "options": [
                                    "K",
                                    "L"
                                ],
                                "title": "Buffer Type"
                            },
                            {
                                "name": "probes_type",
                                "type": "select",
                                "required": false,
                                "default": "Strep-Tactin XT",
                                "options": [
                                    "Strep-Tactin XT",
                                    "SA XT",
                                    "Anti-Human IgG Fc Gen II",
                                    "Anti-His",
                                    "Protein A",
                                    "Anti-Mouse IgG Fc",
                                    "Anti-VHH",
                                    "APS"
                                ],
                                "title": "Probes Type"
                            }
                        ]
                    },
                    {
                        "name": "positive_control_runs",
                        "type": "array",
                        "required": false,
                        "default": [
                            {
                                "outcome": "",
                                "results": []
                            }
                        ],
                        "title": "Positive Control Runs",
                        "itemFields": [
                            {
                                "name": "outcome",
                                "type": "select",
                                "required": false,
                                "default": "",
                                "options": [
                                    "pass",
                                    "uncertain",
                                    "fail"
                                ],
                                "title": "Outcome"
                            },
                            {
                                "name": "results",
                                "type": "array",
                                "required": false,
                                "default": [],
                                "itemFields": [
                                    {
                                        "name": "key",
                                        "type": "string",
                                        "required": false,
                                        "title": "Concentration (nM)"
                                    },
                                    {
                                        "name": "value",
                                        "type": "string",
                                        "required": false,
                                        "title": "NSB (nM)"
                                    }
                                ]
                            },
                            {
                                "name": "buffer_type",
                                "type": "select",
                                "required": false,
                                "default": "",
                                "options": [
                                    "K",
                                    "L"
                                ],
                                "title": "Buffer Type"
                            },
                            {
                                "name": "probes_type",
                                "type": "select",
                                "required": false,
                                "default": "Strep-Tactin XT",
                                "options": [
                                    "Strep-Tactin XT",
                                    "SA XT",
                                    "Anti-Human IgG Fc Gen II",
                                    "Anti-His",
                                    "Protein A",
                                    "Anti-Mouse IgG Fc",
                                    "Anti-VHH",
                                    "APS"
                                ],
                                "title": "Probes Type"
                            }
                        ]
                    }
                ]
            }
        ]
    },
  },
  {
    id: "0197c4d2-bcea-375e-f647-8ab50e72749f",
    name: "Target Prep - BE: Column Purification",
    durationMinutes: 60,
    plateTypeId: "01957ccd-a90a-af38-0350-a9e08b55a626",
    machineTypeId: undefined,
    paramSchema: {
        "title": "Antigen Prep - Column Purification",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "buffer",
                "type": "string",
                "required": true,
                "default": "Buffer BE"
            },
            {
                "name": "input_volume",
                "type": "number",
                "required": false,
                "unit": "uL"
            },
            {
                "name": "reconstituted_stocks",
                "type": "array",
                "required": false,
                "itemFields": [
                    {
                        "name": "plate_id",
                        "type": "string",
                        "required": true,
                        "title": "Plate ID"
                    },
                    {
                        "name": "plate_code",
                        "type": "string",
                        "required": false,
                        "title": "Plate Code"
                    },
                    {
                        "name": "material_stock_id",
                        "type": "string",
                        "required": true,
                        "title": "Inventory Stock"
                    }
                ]
            }
        ]
    },
  },
  {
    id: "01909d14-af95-75e6-4a02-7349858be9b2",
    name: "Target Prep - BE: Dialysis",
    durationMinutes: 900,
    plateTypeId: "01957ccd-a90a-af38-0350-a9e08b55a626",
    machineTypeId: undefined,
    paramSchema: {
        "title": "Antigen Prep - Buffer Exchange",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "buffer",
                "type": "string",
                "required": true,
                "default": "Buffer BE"
            },
            {
                "name": "input_volume",
                "type": "number",
                "required": false,
                "unit": "uL"
            },
            {
                "name": "reconstituted_stocks",
                "type": "array",
                "required": false,
                "itemFields": [
                    {
                        "name": "plate_id",
                        "type": "string",
                        "required": true,
                        "title": "Plate ID"
                    },
                    {
                        "name": "plate_code",
                        "type": "string",
                        "required": false,
                        "title": "Plate Code"
                    },
                    {
                        "name": "material_stock_id",
                        "type": "string",
                        "required": true,
                        "title": "Inventory Stock"
                    }
                ]
            },
            {
                "name": "change_of_buffer_after_2hrs",
                "type": "boolean",
                "required": true,
                "default": true
            }
        ]
    },
  },
  {
    id: "01909d1c-12e6-85eb-5a52-2b90222f39c3",
    name: "Target Prep - Quantification",
    durationMinutes: 60,
    plateTypeId: "01957ccd-a90a-af38-0350-a9e08b55a626",
    machineTypeId: undefined,
    paramSchema: {
        "title": "Antigen Prep - Quantification",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "buffer_exchanged_stocks",
                "type": "array",
                "required": false,
                "itemFields": [
                    {
                        "name": "plate_id",
                        "type": "string",
                        "required": true,
                        "title": "Plate ID"
                    },
                    {
                        "name": "tube_type",
                        "type": "select",
                        "required": false,
                        "default": "1.5mL",
                        "options": [
                            "1.5mL",
                            "5mL"
                        ]
                    },
                    {
                        "name": "plate_code",
                        "type": "string",
                        "required": false,
                        "title": "Plate Code"
                    },
                    {
                        "name": "sample_weight",
                        "type": "number",
                        "required": false,
                        "unit": "mg"
                    },
                    {
                        "name": "number_of_tubes",
                        "type": "number",
                        "required": false,
                        "unit": "mg",
                        "default": 1
                    },
                    {
                        "name": "material_stock_id",
                        "type": "string",
                        "required": true,
                        "title": "Inventory Stock"
                    },
                    {
                        "name": "qubit_concentration",
                        "type": "number",
                        "required": false,
                        "unit": "ug/mL"
                    }
                ]
            }
        ]
    },
  },
  {
    id: "0195615e-c56d-603b-0b43-522cbdb52634",
    name: "Target Prep - Reconstitution",
    durationMinutes: 60,
    plateTypeId: "0195800b-b821-db27-a8ef-c1950ac21cea",
    machineTypeId: undefined,
    paramSchema: {
        "title": "Antigen Prep - Reconstitution",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "volume",
                "type": "number",
                "required": false,
                "unit": "uL",
                "title": "Volume"
            },
            {
                "name": "lyophilised_stocks",
                "type": "array",
                "required": false,
                "itemFields": [
                    {
                        "name": "plate_id",
                        "type": "string",
                        "required": true,
                        "title": "Plate ID"
                    },
                    {
                        "name": "plate_code",
                        "type": "string",
                        "required": false,
                        "title": "Plate Code"
                    },
                    {
                        "name": "concentration",
                        "type": "number",
                        "required": false,
                        "unit": "uM",
                        "title": "Concentration"
                    },
                    {
                        "name": "material_stock_id",
                        "type": "string",
                        "required": true,
                        "title": "Inventory Stock"
                    }
                ]
            }
        ]
    },
  },
  {
    id: "0196a00c-e983-91f4-4131-096e8db90a40",
    name: "Thermostability Capillary Holder Prep",
    durationMinutes: 30,
    plateTypeId: "01969fa4-0d05-51f1-5a2a-7859b64c5ee9",
    machineTypeId: undefined,
    paramSchema: {
        "title": "Thermostability Capillary Holder Prep",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "capillary_type",
                "type": "select",
                "required": false,
                "default": "Prometheus High Sensitivity Capillaries",
                "options": [
                    "Prometheus High Sensitivity Capillaries",
                    "Other"
                ]
            }
        ]
    },
  },
  {
    id: "0196a064-9351-576b-9c4c-3b08f48f1f1e",
    name: "Thermostability Run",
    durationMinutes: 60,
    plateTypeId: "01969fa4-0d05-51f1-5a2a-7859b64c5ee9",
    machineTypeId: undefined,
    paramSchema: {
        "title": "Thermostability Run",
        "fields": [
            {
                "name": "notes",
                "type": "string",
                "required": false,
                "default": ""
            },
            {
                "name": "raw_data_file",
                "type": "string",
                "required": false
            },
            {
                "name": "temp_range_max",
                "type": "number",
                "required": true,
                "unit": "C",
                "default": 95
            },
            {
                "name": "temp_range_min",
                "type": "number",
                "required": true,
                "unit": "C",
                "default": 20
            },
            {
                "name": "laser_intensity",
                "type": "number",
                "required": true,
                "unit": "%",
                "default": 100
            },
            {
                "name": "temp_range_increment",
                "type": "number",
                "required": true,
                "unit": "C",
                "default": 1.5
            }
        ]
    },
  },
];
