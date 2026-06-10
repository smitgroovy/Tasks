import argparse
import sys

from config import OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_BASE_URL
from agent import CandidateScreener
from database import Database


def main():
    parser = argparse.ArgumentParser(description='Candidate Screener Agent')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    screen_parser = subparsers.add_parser('screen', help='Screen a resume file')
    screen_parser.add_argument('file', help='Path to resume file')

    stats_parser = subparsers.add_parser('stats', help='Show screening statistics')

    export_parser = subparsers.add_parser('export', help='Export results to JSON')
    export_parser.add_argument('--output', '-o', help='Output file path')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    if not OPENROUTER_API_KEY:
        print('Error: OPENROUTER_API_KEY not set', file=sys.stderr)
        print('Get your key from https://openrouter.ai/keys', file=sys.stderr)
        sys.exit(1)

    db = Database()
    screener = CandidateScreener(
        api_key=OPENROUTER_API_KEY,
        model=OPENROUTER_MODEL,
        base_url=OPENROUTER_BASE_URL,
        db=db,
    )

    if args.command == 'screen':
        import os
        if not os.path.exists(args.file):
            print('Error: File not found: %s' % args.file, file=sys.stderr)
            sys.exit(1)

        result = screener.screen_resume(args.file)
        print('\n' + '='*60)
        print('  Candidate: %s' % result.candidate_name)
        print('  File: %s' % result.filename)
        print('  Match Score: %s%%' % result.match_score)
        print('  Experience: %s years' % result.experience_years)
        print('  Recommendation: %s' % result.recommendation)
        print('\n  Summary:')
        print('  %s' % result.summary)
        print('\n  DB Record ID: %s' % result.id)
        print('='*60 + '\n')

    elif args.command == 'stats':
        stats = db.get_stats()
        print('\n' + '='*40)
        print('  Screening Statistics')
        print('='*40)
        print('  Total Screened:  %s' % stats.get('total_screened', 0))
        print('  Average Score:   %s' % stats.get('average_score', 0))
        print('  Strong Matches:  %s' % stats.get('strong_matches', 0))
        print('  Weak Matches:    %s' % stats.get('weak_matches', 0))
        print('='*40 + '\n')

    elif args.command == 'export':
        output = db.export_to_json(args.output)
        print('Results exported to: %s' % output)


if __name__ == '__main__':
    main()
