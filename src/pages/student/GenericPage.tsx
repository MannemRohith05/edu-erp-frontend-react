import PageContainer from '../../components/PageContainer';
import './GenericPage.css';

interface GenericPageProps {
    title: string;
    icon: string;
    description?: string;
    showFilter?: boolean;
    showTable?: boolean;
}

export default function GenericPage({ title, icon, description, showFilter, showTable }: GenericPageProps) {
    const pageDescription = description || 'relevant information';

    return (
        <PageContainer title={title}>
            <div className="placeholder-content">
                <div className="gp-icon">{icon}</div>
                <h2>{title}</h2>
                <p>This feature is coming soon. The page will display {pageDescription}.</p>
                <div className="coming-soon">
                    <span className="gp-badge">🚧 Under Development</span>
                </div>

                {showFilter && (
                    <div className="filter-section">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label>Academic Year</label>
                                <select>
                                    <option>Select Academic Year</option>
                                    <option>2024-2025</option>
                                    <option>2023-2024</option>
                                    <option>2022-2023</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Semester</label>
                                <select>
                                    <option>Select Semester</option>
                                    <option>1</option>
                                    <option>2</option>
                                </select>
                            </div>
                            <div className="filter-actions">
                                <button className="gp-btn-primary">Search</button>
                                <button className="gp-btn-secondary">Reset</button>
                            </div>
                        </div>
                    </div>
                )}

                {showTable && (
                    <div className="table-placeholder">
                        <div className="table-header-row">
                            <span>#</span>
                            <span>Column 1</span>
                            <span>Column 2</span>
                            <span>Column 3</span>
                            <span>Status</span>
                        </div>
                        <div className="table-empty">
                            <p>No data available</p>
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
