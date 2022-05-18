import React, { useMemo } from 'react';
import {
        Chart as ChartJS,
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
);

const options = {
        responsive: true,
        plugins: {
                legend: {
                        display: false
                }
        },
};

export function ContestChart({ candidates, contestName }) {
        const data = useMemo(() => ({
                labels: candidates.map((candidate, index) => `${index + 1}: ${candidate.name}`),
                datasets: [
                        {
                                label: null,
                                data: candidates.map(candidate => candidate.voteCount),
                                backgroundColor: candidates.map(() => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`),
                        }
                ]
        }), [candidates, contestName]);

        return <Bar options={options} data={data} />;
}
