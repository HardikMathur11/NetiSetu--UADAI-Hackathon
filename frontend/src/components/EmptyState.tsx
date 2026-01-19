import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileSearch, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    actionLink?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = "No Active Dataset",
    description = "Please upload a file or select a dataset from the dashboard to view this analysis.",
    actionLabel = "Go to Dashboard",
    actionLink = "/dashboard"
}) => {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4 animate-in fade-in zoom-in duration-500">
            <Card className="max-w-md w-full text-center border-dashed border-2 shadow-sm">
                <CardContent className="pt-10 pb-10 space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                        <FileSearch className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            {description}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 max-w-xs mx-auto">
                        <Button asChild className="w-full">
                            <Link to={actionLink}>
                                {actionLink === '/upload' ? <Upload className="mr-2 h-4 w-4" /> : null}
                                {actionLabel}
                            </Link>
                        </Button>
                        {actionLink !== '/upload' && (
                            <Button variant="outline" asChild className="w-full h-8 text-xs border-dashed">
                                <Link to="/upload">
                                    Or Upload New File
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
