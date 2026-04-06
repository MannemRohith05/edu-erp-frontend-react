export default function TeacherCertifications() {
    const certifications = [
        { id: 1, title: 'Advanced Python Programming', issuer: 'Coursera', date: '2024-06-15', type: 'Course Completion', icon: '🐍' },
        { id: 2, title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2024-03-20', type: 'Professional Certification', icon: '☁️' },
        { id: 3, title: 'Machine Learning Specialization', issuer: 'Stanford Online', date: '2023-11-10', type: 'Specialization', icon: '🤖' },
        { id: 4, title: 'Best Researcher Award 2024', issuer: 'IEEE Conference', date: '2024-09-05', type: 'Achievement', icon: '🏅' },
        { id: 5, title: 'Published Paper: AI in Education', issuer: 'Springer Journal', date: '2024-07-22', type: 'Publication', icon: '📄' },
        { id: 6, title: 'Oracle Certified Professional', issuer: 'Oracle', date: '2023-08-14', type: 'Professional Certification', icon: '🔴' },
    ];

    const achievements = [
        { id: 1, title: 'Outstanding Faculty Award', year: '2024', description: 'Recognized for excellence in teaching and student mentorship', icon: '🏆' },
        { id: 2, title: '100% Student Pass Rate', year: '2024', description: 'Achieved 100% pass rate in Data Structures course', icon: '⭐' },
        { id: 3, title: 'Research Grant Recipient', year: '2023', description: 'Received ₹5,00,000 research grant for AI in Education project', icon: '💰' },
        { id: 4, title: 'Conference Keynote Speaker', year: '2024', description: 'Delivered keynote at International CS Education Conference', icon: '🎤' },
    ];

    return (
        <div>
            <div className="admin-page-header">
                <h1>Certifications & Achievements</h1>
                <p>Your professional certifications and accomplishments</p>
            </div>

            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon pink">📜</div>
                    <div><div className="admin-stat-value">{certifications.length}</div><div className="admin-stat-label">Certifications</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon amber">🏆</div>
                    <div><div className="admin-stat-value">{achievements.length}</div><div className="admin-stat-label">Achievements</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green">📄</div>
                    <div><div className="admin-stat-value">{certifications.filter(c => c.type === 'Publication').length}</div><div className="admin-stat-label">Publications</div></div>
                </div>
            </div>

            <div className="admin-quick-grid">
                <div className="admin-action-card">
                    <h3>🏆 Achievements</h3>
                    <div className="admin-action-list">
                        {achievements.map(a => (
                            <div key={a.id} className="admin-action-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, cursor: 'default' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                                    <span style={{ fontSize: 22 }}>{a.icon}</span>
                                    <span style={{ fontWeight: 600, color: '#fff', flex: 1 }}>{a.title}</span>
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{a.year}</span>
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', paddingLeft: 32 }}>{a.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="admin-table-card" style={{ marginTop: 20 }}>
                <div className="admin-table-header">
                    <h3>📜 Certifications ({certifications.length})</h3>
                </div>
                <table className="admin-table">
                    <thead><tr><th></th><th>Title</th><th>Issuer</th><th>Type</th><th>Date</th></tr></thead>
                    <tbody>
                        {certifications.map(c => (
                            <tr key={c.id}>
                                <td style={{ fontSize: 20 }}>{c.icon}</td>
                                <td><strong>{c.title}</strong></td>
                                <td>{c.issuer}</td>
                                <td><span className="role-tag student">{c.type}</span></td>
                                <td>{new Date(c.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
