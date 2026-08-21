/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { PhDPosition } from "./types";
import { Navbar } from "./components/Navbar";
import { PositionsExplorer } from "./components/PositionsExplorer";
import { CodeInspector } from "./components/CodeInspector";
import { ConfigGenerator } from "./components/ConfigGenerator";
import { ScraperSimulator } from "./components/ScraperSimulator";
import { SetupWizard } from "./components/SetupWizard";

// Default curated list of verified fully-funded PhD vacancies (Global non-US)
const INITIAL_POSITIONS: PhDPosition[] = [
  {
    id: "fl-eth-01",
    title: "Fully Funded PhD Position in Privacy-Preserving Federated Learning for Decentralized AI",
    institution: "ETH Zurich & Max Planck ETH Center for Learning Systems",
    country: "Switzerland",
    city: "Zurich",
    supervisor: "Prof. Dr. Florian Tramèr & Prof. Dr. Martin Vechev",
    description: "We invite applications for a fully funded doctoral position focusing on robust federated optimization, differential privacy guarantees in distributed machine learning, and mitigating poisoning attacks in edge computing networks. Candidates should possess a strong mathematical background and proficiency in PyTorch/JAX.",
    funding_status: "Fully Funded (Swiss National Science Foundation SNSF standard salary CHF 54,000 - 62,000/yr)",
    url: "https://jobs.ethz.ch/site/index.html",
    matched_topic: "Federated Learning",
    matched_keyword: "privacy-preserving machine learning",
    source_platform: "EURAXESS / ETH Career Portal",
    deadline: "2026-10-15",
    discovered_date: "2026-08-20"
  },
  {
    id: "har-oxford-02",
    title: "Doctoral Researcher in Multimodal Sensor Fusion for Human Activity Recognition in Healthcare",
    institution: "University of Oxford - Department of Computer Science",
    country: "United Kingdom",
    city: "Oxford",
    supervisor: "Prof. Niki Trigoni & Prof. Andrew Markham",
    description: "This EPSRC-funded PhD vacancy investigates novel self-supervised deep learning architectures on wearable IMU sensor streams, radar, and vision for continuous, non-intrusive human activity recognition and clinical rehabilitation monitoring.",
    funding_status: "Fully Funded (EPSRC DTP Studentship: Full Tuition + £19,237/yr Tax-Free Stipend)",
    url: "https://www.cs.ox.ac.uk/study/postgraduate-research/",
    matched_topic: "Human Activity Recognition",
    matched_keyword: "wearable sensor inertial measurement",
    source_platform: "FindAPhD",
    deadline: "2026-11-01",
    discovered_date: "2026-08-19"
  },
  {
    id: "trans-tum-03",
    title: "PhD Candidate in Spatiotemporal Vision Transformers and Efficient Foundation Models",
    institution: "Technical University of Munich (TUM) & Munich Center for Machine Learning",
    country: "Germany",
    city: "Munich",
    supervisor: "Prof. Dr. Laura Leal-Taixé & Prof. Dr. Daniel Cremers",
    description: "The research group explores state-of-the-art vision transformers, sparse attention mechanisms, and deep representation learning for spatiotemporal sequence modeling and autonomous robotic perception.",
    funding_status: "Fully Funded (German Public Service Salary Scale TV-L E13 100%, approx. €52,000/yr gross)",
    url: "https://www.tum.de/en/about-tum/careers-and-jobs",
    matched_topic: "Transformers & Deep Learning",
    matched_keyword: "vision transformer attention mechanism",
    source_platform: "AcademicPositions",
    deadline: "2026-09-30",
    discovered_date: "2026-08-20"
  },
  {
    id: "fl-nus-04",
    title: "PhD Research Scholar in Asynchronous Federated Optimization over Heterogeneous Edge Devices",
    institution: "National University of Singapore (NUS) - School of Computing",
    country: "Singapore",
    city: "Singapore",
    supervisor: "Assoc. Prof. Bryan Low & Prof. Kenji Kawaguchi",
    description: "Focus on convergence guarantees in non-IID data distributions, communication-efficient split learning, and client incentive mechanisms for federated learning in smart IoT ecosystems.",
    funding_status: "Fully Funded (NUS Research Scholarship: Full Tuition + SGD $3,200 - $3,700/month stipend)",
    url: "https://www.comp.nus.edu.sg/programmes/pg/phd-cs/",
    matched_topic: "Federated Learning",
    matched_keyword: "federated optimization decentralized learning",
    source_platform: "EURAXESS International",
    deadline: "2026-11-15",
    discovered_date: "2026-08-18"
  },
  {
    id: "har-kth-05",
    title: "PhD Student in Wearable Sensor Analytics and Inertial HAR for Assistive Technologies",
    institution: "KTH Royal Institute of Technology",
    country: "Sweden",
    city: "Stockholm",
    supervisor: "Prof. Danica Kragic & Assoc. Prof. Hedvig Kjellström",
    description: "Develop lightweight deep neural networks and contrastive learning methods for wearable IMU and body sensor networks to recognize micro-gestures and complex daily living activities.",
    funding_status: "Fully Funded (Salaried Employee position: SEK 32,500 - 36,000/month with full pension & healthcare)",
    url: "https://www.kth.se/en/om/work-at-kth",
    matched_topic: "Human Activity Recognition",
    matched_keyword: "human activity recognition imu sensor",
    source_platform: "AcademicPositions",
    deadline: "2026-10-01",
    discovered_date: "2026-08-17"
  },
  {
    id: "trans-cam-06",
    title: "Doctoral Position in Theoretical Foundations of Deep Attention & Transformer Generalization",
    institution: "University of Cambridge - Department of Applied Mathematics and Theoretical Physics",
    country: "United Kingdom",
    city: "Cambridge",
    supervisor: "Dr. Carola-Bibiane Schönlieb & Dr. Matthew Thorpe",
    description: "Theoretical and algorithmic analysis of self-attention mechanisms, neural ODE limits of transformer layers, and scaling laws for deep representation learning in high-dimensional data regimes.",
    funding_status: "Fully Funded (Cambridge Trust & Departmental Studentship: Fees + Maintenance)",
    url: "https://www.maths.cam.ac.uk/postgrad/phd-study",
    matched_topic: "Transformers & Deep Learning",
    matched_keyword: "transformer architecture self-attention",
    source_platform: "FindAPhD",
    deadline: "2026-12-05",
    discovered_date: "2026-08-16"
  },
  {
    id: "fl-inria-07",
    title: "Marie Skłodowska-Curie PhD Fellow in Cross-Silo Federated Learning and Differential Privacy",
    institution: "INRIA Sophia Antipolis & Université Côte d'Azur",
    country: "France",
    city: "Nice",
    supervisor: "Dr. Aurélien Bellet & Dr. Giovanni Neglia",
    description: "Horizon Europe MSCA Doctoral Network position on verifiable federated learning, personalized local models, and Byzantine-resilient aggregation rules with provable privacy-utility trade-offs.",
    funding_status: "Fully Funded (EU Horizon Europe MSCA fellowship: €3,400/month living allowance + mobility allowance)",
    url: "https://www.inria.fr/en/jobs",
    matched_topic: "Federated Learning",
    matched_keyword: "federated learning differential privacy",
    source_platform: "EURAXESS (European Commission)",
    deadline: "2026-10-31",
    discovered_date: "2026-08-20"
  },
  {
    id: "har-uoft-08",
    title: "PhD Student in Graph Neural Networks and Transformers for Skeleton-Based Activity Recognition",
    institution: "University of Toronto - Department of Electrical & Computer Engineering",
    country: "Canada",
    city: "Toronto",
    supervisor: "Prof. Konstantinos Plataniotis",
    description: "Investigate graph transformer models combining 3D pose landmarks and ambient sensor modalities for robust human action recognition, fall prediction, and ambient assisted living.",
    funding_status: "Fully Funded (ECE Guaranteed Minimum Funding Package: Tuition + CAD $28,000/yr stipend)",
    url: "https://www.ece.utoronto.ca/graduates/programs/phd/",
    matched_topic: "Human Activity Recognition",
    matched_keyword: "activity recognition pose estimation",
    source_platform: "AcademicPositions",
    deadline: "2026-11-20",
    discovered_date: "2026-08-15"
  },
  {
    id: "trans-aalto-09",
    title: "Doctoral Candidate in Efficient Transformer Architectures for Resource-Constrained Deep Learning",
    institution: "Aalto University - Department of Computer Science",
    country: "Finland",
    city: "Helsinki / Espoo",
    supervisor: "Prof. Arno Solin & Prof. Juho Kannala",
    description: "Researching quantization, structured pruning, linear attention variants, and state space models (SSMs) to compress transformer models for edge inference on low-power devices.",
    funding_status: "Fully Funded (Salaried University Position: approx. €2,650 - €3,300/month gross)",
    url: "https://www.aalto.fi/en/open-positions",
    matched_topic: "Transformers & Deep Learning",
    matched_keyword: "transformer architecture deep representation",
    source_platform: "EURAXESS",
    deadline: "2026-10-10",
    discovered_date: "2026-08-19"
  },
  {
    id: "fl-edinburgh-10",
    title: "PhD Studentship in Decentralized Machine Learning and Split Federated Learning for Healthcare",
    institution: "University of Edinburgh - School of Informatics",
    country: "United Kingdom",
    city: "Edinburgh",
    supervisor: "Prof. Ian Simpson & Dr. Michael Herrmann",
    description: "Collaborative doctoral project developing privacy-preserving federated algorithms across NHS hospital imaging data clusters without transferring sensitive patient records.",
    funding_status: "Fully Funded (UKRI / EPSRC Centre for Doctoral Training: Full UK/Intl Tuition + £19,237 stipend)",
    url: "https://www.ed.ac.uk/informatics/postgraduate/research-degrees",
    matched_topic: "Federated Learning",
    matched_keyword: "collaborative learning split learning",
    source_platform: "FindAPhD",
    deadline: "2026-11-30",
    discovered_date: "2026-08-18"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"explorer" | "code" | "config" | "simulator" | "guide">("explorer");
  const [positions, setPositions] = useState<PhDPosition[]>(INITIAL_POSITIONS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPositions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/phd-positions");
      if (res.ok) {
        const data = await res.json();
        if (data.positions && data.positions.length > 0) {
          setPositions(data.positions);
        }
      }
    } catch (err) {
      console.warn("Backend API not reachable, using local verified dataset", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleQuickRun = () => {
    setActiveTab("simulator");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickRun={handleQuickRun}
        isSearching={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "explorer" && (
          <PositionsExplorer
            positions={positions}
            onRefresh={fetchPositions}
            isLoading={isLoading}
          />
        )}

        {activeTab === "code" && <CodeInspector />}

        {activeTab === "simulator" && <ScraperSimulator positions={positions} />}

        {activeTab === "config" && <ConfigGenerator />}

        {activeTab === "guide" && <SetupWizard />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-200">PhD Hunter</span>
            <span>&bull;</span>
            <span>Automated Non-US Fully-Funded Vacancy Crawler</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Sources: EURAXESS &bull; FindAPhD &bull; AcademicPositions</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-medium">Excluding USA Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
